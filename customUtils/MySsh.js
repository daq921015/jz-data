/**
 * Created by Administrator on 2017-11-24.
 * 隧道机一定要安装 nmap和nc命令  yum -y install nmap nc
 */
let fs = devops.fs;
let path = devops.path;
let moment = devops.moment;
let Client = devops.ssh2.Client;
let through = devops.through;
let myssh = {};


myssh.getRemoteSshConn = function () {
    /*
     * 获取远程ssh连接
     * 参数[outserver]或[outserver,innerserver]
     * [outconn]或[outconn,innerconn];
     * */
    //分配参数
    let outserver, innerserver, outConn, innerConn;
    if (arguments.length === 1) {
        outserver = arguments[0];
    } else if (arguments.length == 2) {
        outserver = arguments[0];
        innerserver = arguments[1];
        innerConn = new Client();
    } else {
        return Promise.reject("获取远程服务器ssh连接，参数不匹配");
    }
    outConn = new Client();
    return new Promise(function (resolve, reject) {
        //获取第一层ssh连接
        outConn.on('ready', function () {
            console.log(outserver['host'] + ":" + outserver['port'] + " connect");
            resolve(outConn);
        }).on('error', function (err) {
            console.log(outserver['host'] + ":" + outserver['port'] + ' 服务器连接失败');
            reject(err);
        }).on('close', function (err) {
            if (err) {
                reject(err);
            } else {
                console.log(outserver['host'] + ":" + outserver['port'] + ' close.');
            }
        }).connect(outserver);
    }).then(outConn => {
        //获取第二层连接
        if (typeof innerConn === "undefined") {
            return Promise.resolve([outConn]);
        }
        let cmd = 'nmap -sS -p ' + innerserver["port"] + " " + innerserver["host"];
        //先检测nmap是否通
        return myssh.execRemoteCmd(outConn, cmd).then(data => {
            let check = data.indexOf("open");
            if (check <= 0) {
                outConn.end();
                return Promise.reject(cmd + ":端口检测不通，服务器未启动");
            }
        }).then(data => {
            //利用nc stream连接内部服务器
            let nc_cmd = 'nc -w 10 ' + innerserver["host"] + ' ' + innerserver['port'];
            return new Promise(function (resolve, reject) {
                outConn.exec(nc_cmd, function (err, stream) {
                    if (err) {
                        outConn.end();
                        console.log(innerserver['host'] + ":" + innerserver['port'] + ' 服务器连接失败');
                        reject(err);
                    }
                    innerConn.on('ready', function () {
                        console.log(innerserver['host'] + ":" + innerserver['port'] + " connect");
                        resolve([outConn, innerConn]);
                    }).on('error', function (err) {
                        outConn.end();
                        console.log(innerserver['host'] + ":" + innerserver['port'] + ' 服务器连接失败');
                        reject(err);
                    }).on('close', function (err) {
                        if (err) {
                            reject(err);
                        }
                        console.log(innerserver['host'] + ":" + innerserver['port'] + ' close.');
                    }).connect({
                        sock: stream,
                        username: innerserver["username"],
                        password: innerserver["password"],
                        port: innerserver["port"]
                    });
                });
            });
        });
    });
};
myssh.getRemoteExists = function (conn, remotePath) {
    /*
     * 判断远程目录或文件是否存在
     * 参数：
     *       conn:远程连接
     *       remotePath:远程路径
     * */
    return new Promise(function (resolve, reject) {
        conn.sftp(function (err, sftp) {
            if (err) {
                reject(err);
            } else {
                sftp.exists(remotePath, function (result) {
                    sftp.end();
                    if (!result) {
                        reject("远程服务器路径不存在:" + remotePath);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });
};
myssh.getRemoteSftpDir = function (conn, remotePath) {
    /*
     * 描述：获取sftp文件夹下文件;
     * 参数：conn:远程连接
     *       remotePath：远程路径
     * 返回：[{},{}] 对象中问文件属性
     * */
    return myssh.getRemoteExists(conn, remotePath).then(data => {
        return new Promise(function (resolve, reject) {
            conn.sftp(function (err, sftp) {
                if (err) {
                    reject(err);
                } else {
                    sftp.readdir(remotePath, function (err, result) {
                        sftp.end();
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                }
            });
        });
    });
};
myssh.getRemoteFileOrDirList = function (conn, remotePath, isFile) {
    /*
     * 描述：获取远程文件路径下文件列表信息
     * 参数:
     *      conn:远程连接
     *      remotePath:远程路径；
     *      isFile:是否是获取文件，true获取文件信息，false获取目录信息；
     * 返回：dirs 获取的列表信息
     * */
    let cmd = "find " + remotePath + " -type " + (isFile == true ? "f" : "d") + "\nexit\n";
    return myssh.execRemoteCmd(conn, cmd).then(data => {
        let dirs = [];
        let arr = data.split("\r\n");
        arr.forEach(function (dir) {
            if (dir.indexOf(remotePath) == 0) {
                dirs.push(dir);
            }
        });
        return Promise.resolve(dirs);
    });
};

myssh.execRemoteCmd = function (conn, cmd) {
    /*
     * 执行远程命令
     * 参数：conn:远程连接，cmd：执行命令
     * 返回：data
     * */
    return new Promise(function (resolve, reject) {
        conn.exec(cmd, function (err, stream) {
            if (err) {
                reject(err);
            } else {
                let data = "";
                stream.pipe(through(function onWrite(buf) {
                    data = data + buf;
                }, function onEnd() {
                    stream.unpipe();
                }));
                stream.on('close', function () {
                    resolve('' + data);
                });
            }
        });
    });
};
myssh.execRemoteUploadFile = function (conn, localPath, remotePath) {
    /*
     * 描述：上传文件,本地文件不存在报错，远程目录不存在递归创建
     * 参数：
     *      conn:远程连接
     *      localPath:本地路径
     *      remotePath:远程路径
     * */
    return myssh.getLocalExists(localPath).then(data => {
        if (!data) {
            return Promise.reject("上传文件，本地文件不存在");
        }
        //确保远程目录存在，不存在则创建
        return myssh.execRemoteMakeDirs(conn, path.dirname(remotePath));
    }).then(data => {
        return new Promise(function (resolve, reject) {
            conn.sftp(function (err, sftp) {
                if (err) {
                    reject(err);
                } else {
                    resolve(sftp);
                }
            });
        });
    }).then(sftp => {
        return new Promise(function (resolve, reject) {
            sftp.fastPut(localPath, remotePath, function (err, result) {
                sftp.end();
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
};
myssh.execRemoteMakeDirs = function (conn, remoteDir) {
    /*
     * 描述：创建目录
     * 参数:
     *      conn:远程连接
     *      remoteDir:远程路径；
     * 返回：data创建目录之后返回的信息
     * */
    let cmd = 'mkdir -p ' + remoteDir + '\nexit\n';
    return myssh.execRemoteCmd(conn, cmd);
};
myssh.execRemoteUploadDirFile = function (conn, localDir, remoteDir) {
    /*
     * 上传本地目录下的所有文件（非递归）到远程指定目录下
     * */
    return myssh.getLocalIsDirectory(localDir).then(data => {
        //确保远程目录存在
        return myssh.execRemoteMakeDirs(conn, remoteDir);
    }).then(data => {
        return myssh.getLocalReadDirFiles(localDir);
    }).then(async files => {
        try {
            for (let i = 0, j = files.length; i < j; i++) {
                let localPath = path.join(localDir, files[i]);
                let remotePath = remoteDir.replace(/(\\|\/)$/, "") + "/" + files[i];//此处不能用path.join()
                await myssh.execRemoteUploadFile(conn, localPath, remotePath);
            }
        } catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve();
    });
};
myssh.execRemoteDownloadFile = function (conn, remotePath, localPath) {
    /*
     * 描述：下载文件,远程文件不存在返回错误，本地目录不存在创建目录
     * 参数：
     *      conn:远程连接
     *      localPath:本地文件路径
     *      remotePath:远程文件
     * */
    return myssh.getRemoteExists(conn, remotePath).then(data => {
        //确保本地目录存在，不存在则递归创建
        myssh.execLocalMakeDirsSync(path.dirname(localPath));
        return new Promise(function (resolve, reject) {
            conn.sftp(function (err, sftp) {
                if (err) {
                    reject(err);
                } else {
                    //下载远程文件
                    sftp.fastGet(remotePath, localPath, function (err, result) {
                        sftp.end();
                        if (err) {
                            reject(err);
                        }
                        resolve(result);
                    });
                }
            });
        });
    });
};

myssh.execLocalMakeDirsSync = function (localPath) {
    /*
     * 创建本地目录(同步)
     * */
    let father = myssh.getLocalExistsSync(path.dirname(localPath));
    if (!father) {//父目录存在则创建父目录
        myssh.execLocalMakeDirsSync(path.dirname(localPath));//父目录也不存在，递归
    }
    if (!myssh.getLocalExistsSync(localPath)) {//创建目录
        fs.mkdirSync(localPath);
    }
};
myssh.getLocalReadDir = localPath => {
    /*
     * 读取目录下的所有文件和目录
     * */
    return myssh.getLocalExists(localPath).then(exist => {
        if (!exist) {
            return Promise.reject("目录不存在:" + localPath);
        }
        return new Promise((resolve, reject) => {
            fs.readdir(localPath, function (err, files) {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            })
        });
    });
};
myssh.getLocalReadDirSync = localPath => {
    let exists = myssh.getLocalExistsSync(localPath);
    if (!exists) {
        return [];
    } else {
        return fs.readdirSync(localPath);
    }
};
myssh.getLocalReadDirFiles = function (localPath) {
    /*
     * 读取目录下的所有文件
     * */
    return myssh.getLocalReadDir(localPath).then(files => {
        let _re = [];
        for (let i = 0, j = files.length; i < j; i++) {
            let file_path = path.join(localPath, files[i]);
            if (fs.statSync(file_path).isFile()) {
                _re.push(files[i]);
            }
        }
        return Promise.resolve(_re);
    });
};
myssh.getLocalReadDirFilesSync = function (localPath) {
    let files = myssh.getLocalReadDirSync(localPath);
    let _re = [];
    for (let i = 0, j = files.length; i < j; i++) {
        let file_path = path.join(localPath, files[i]);
        if (fs.statSync(file_path).isFile()) {
            _re.push(files[i]);
        }
    }
    return _re;
};
myssh.getLocalReadDirFilesDetail = function (localPath) {
    /*
     * 读取目录下的所有文件详情
     * */
    return myssh.getLocalReadDir(localPath).then(files => {
        let files_detail = {};
        for (let i = 0, j = files.length; i < j; i++) {
            let file_path = path.join(localPath, files[i]);
            let stat = fs.statSync(file_path);
            if (stat.isFile()) {
                let file_size, file_crate_time, file_modify_time;
                if (parseFloat((stat.size / (1024 * 1024))) > 1) {
                    file_size = (stat.size / (1024 * 1024)).toFixed(2) + "M";
                } else {
                    file_size = (stat.size / 1024).toFixed(2) + "K";
                }
                file_crate_time = moment(stat.birthtime).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
                file_modify_time = moment(stat.mtime).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
                files_detail[files[i]] = {
                    file_path: file_path,
                    file_size: file_size,
                    file_crate_time: file_crate_time,
                    file_modify_time: file_modify_time
                }
            }
        }
        return Promise.resolve(files_detail);
    });
};
myssh.getLocalReadDirFilesDetailSync = function (localPath) {
    let files = myssh.getLocalReadDirSync(localPath);
    let files_detail = {};
    for (let i = 0, j = files.length; i < j; i++) {
        let file_path = path.join(localPath, files[i]);
        let stat = fs.statSync(file_path);
        if (stat.isFile()) {
            let file_size, file_crate_time, file_modify_time;
            if (parseFloat((stat.size / (1024 * 1024))) > 1) {
                file_size = (stat.size / (1024 * 1024)).toFixed(2) + "M";
            } else {
                file_size = (stat.size / 1024).toFixed(2) + "K";
            }
            file_crate_time = moment(stat.birthtime).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
            file_modify_time = moment(stat.mtime).utcOffset(8).format("YYYY-MM-DD HH:mm:ss");
            files_detail[files[i]] = {
                file_name: files[i],
                file_size: file_size,
                file_crate_time: file_crate_time,
                file_modify_time: file_modify_time
            }
        }
    }
    return files_detail;
};
myssh.getLocalExists = function (localPath) {
    /*
     * 文件或文件夹是否存在（封装fs）
     * */
    return new Promise((resolve) => {
        fs.exists(localPath, function (exist) {
            resolve(exist);
        });
    });
};
myssh.getLocalExistsSync = function (localPath) {
    return fs.existsSync(localPath);
};
myssh.getLocalStat = function (localPath) {
    return new Promise((resolve, reject) => {
        fs.stat(localPath, function (err, stats) {
            if (err) {
                reject(err);
            } else {
                resolve(stats);
            }
        });
    });
};
myssh.getLocalStatSync = function (localPath) {
    return fs.statSync(localPath);
};
myssh.getLocalIsDirectory = function (localPath) {
    /*
     * 是否为目录
     * */
    return myssh.getLocalExists(localPath).then(exist => {
        if (!exist) {
            return Promise.reject("目录不存在:" + localPath);
        }
        return myssh.getLocalStat(localPath).then(stats => {
            return new Promise((resolve) => {
                resolve(stats.isDirectory());
            });
        });
    });
};
myssh.getLocalIsDirectorySync = function (localPath) {
    let exists = myssh.getLocalExistsSync(localPath);
    if (!exists) {
        return exists;
    }
    let stat = myssh.getLocalStatSync(localPath);
    return stat.isDirectory();
};
myssh.getLocalIsFile = function (localPath) {
    /*
     * 是否为文件
     * */
    return myssh.getLocalExists(localPath).then(exist => {
        if (!exist) {
            return Promise.reject("目录不存在:" + localPath);
        }
        return myssh.getLocalStat(localPath).then(stats => {
            return new Promise((resolve) => {
                resolve(stats.isFile());
            });
        });
    });
};
myssh.getLocalIsFileSync = function (localPath) {
    let exists = myssh.getLocalExistsSync(localPath);
    if (!exists) {
        return exists;
    }
    let stat = myssh.getLocalStatSync(localPath);
    return stat.isFile();
};
module.exports = myssh;
