大屏展示平台
功能：
1、具有后台页面，支持直接登录，获取大屏完整页面（dev.smartpos.top）(任意线上用户直接登录即可)
2、支持通过用户参数，调用大屏数据接口


调用地址：
1、外部调用 https://dev.smartpos.top:80
2、内部调用 http://192.168.93.201:80

数据接口说明：
1、今日销售额
    接口：GET /fresh/today/saleAmount 
    参数：
        tenantId:商户id （必填）
        partitionCode:商户分区（za1或zd1）（必填）
    示例：https://dev.smartpos.top/fresh/today/saleAmount?tenantId=13522&partitionCode=za1
2、今日销售笔数
    接口：GET /fresh/today/saleCount 
    参数：
        tenantId:商户id（必填）
        partitionCode:商户分区（za1或zd1）（必填）
    示例：https://dev.smartpos.top/fresh/today/saleCount?tenantId=13522&partitionCode=za1
3、今日平均客单价
    接口：GET /fresh/today/saleAmountPer 
    参数：
        tenantId:商户id（必填）
        partitionCode:商户分区（za1或zd1）（必填）
    示例：https://dev.smartpos.top/fresh/today/saleAmountPer?tenantId=13522&partitionCode=za1
4、昨日销售金额
    接口：GET /fresh/yestoday/saleAmount 
    参数：
        tenantId:商户id（必填）
        partitionCode:商户分区（za1或zd1）（必填）
    示例：https://dev.smartpos.top/fresh/yestoday/saleAmount?tenantId=13522&partitionCode=za1
5、昨日销售笔数
    接口：GET /fresh/yestoday/saleCount 
    参数：
        tenantId:商户id（必填）
        partitionCode:商户分区（za1或zd1）（必填）
    示例：https://dev.smartpos.top/fresh/yestoday/saleCount?tenantId=13522&partitionCode=za1
6、昨日平均客单价
    接口：GET /fresh/yestoday/saleAmountPer 
    参数：
        tenantId:商户id（必填）
        partitionCode:商户分区（za1或zd1）（必填）
    示例：https://dev.smartpos.top/fresh/yestoday/saleAmountPer?tenantId=13522&partitionCode=za1
7、今日门店销售排行
    接口：GET /fresh/today/branchTop
    参数：
        tenantId:商户id（必填）
        partitionCode:商户分区（za1或zd1）（必填）
        displayCount：返回的门店数量（非必填，默认值10）
    响应：数据按照销售额倒序排列
    示例：https://dev.smartpos.top/fresh/today/branchTop?tenantId=13522&partitionCode=za1&displayCount=10
8、今日收款方式占比
    接口：GET /fresh/today/paymentAmount
    参数：
        tenantId:商户id（必填）
        partitionCode:商户分区（za1或zd1）（必填）
    示例：https://dev.smartpos.top/fresh/today/paymentAmount?tenantId=13522&partitionCode=za1
9、近N天销售情况
接口：GET /fresh/nearday/saleAmount
参数：
    tenantId:商户id（必填）
    partitionCode:商户分区（za1或zd1）（必填）
    displayCount：最近天数（非必填，默认值30）
    响应：按照日期升序排列
示例：https://dev.smartpos.top/fresh/nearday/saleAmount?tenantId=13522&partitionCode=za1&displayCount=30
10、今日畅销单品销售额排行
接口：GET /fresh/today/goodsTop
参数：
    tenantId:商户id（必填）
    partitionCode:商户分区（za1或zd1）（必填）
    displayCount：展示商品数（非必填，默认值15）
    响应：按照销售额倒序排列
示例：https://dev.smartpos.top/fresh/today/goodsTop?tenantId=13522&partitionCode=za1&displayCount=15
11、今日时段销售情况
接口：GET /fresh/today/hourSaleAmount
参数：
    tenantId:商户id（必填）
    partitionCode:商户分区（za1或zd1）（必填）
示例：https://dev.smartpos.top/fresh/today/hourSaleAmount?tenantId=13522&partitionCode=za1
12、今日分类销售汇总
接口：GET /fresh/today/categoryTop
参数：
tenantId:商户id（必填）
    partitionCode:商户分区（za1或zd1）（必填）
    displayCount：展示分类数（非必填，默认值5）
    响应：按照销售额倒序排列
示例：https://dev.smartpos.top/fresh/today/categoryTop?tenantId=13522&partitionCode=za1&displayCount=5
