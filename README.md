citySelect
==========

a jQuery plugin for areas select

easy to use:

    $.citySelect('select[name="prov"]', 'select[name="city"]', 'select[name="dist"]', {
        initByIp: 'client'
    });

available options:

    $.citySelect.defaults = {
        jsonAreas : './plugins/areas.json.js', //areas json数据获取的url, 必须为js文件, 变量名需为citySelectMainData
        jsonServerIp : '', //server ip数据获取的url, 变量名需为remote_ip_info
        jsonClientIp : 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js', //client ip数据获取的url, 变量名需为remote_ip_info
        initByIp : null, //client或server, initByIp优先级大于手动指定init, 即手动指定init需把initByIp设置为null
        initProv : null, //手动指定初始化省份, 可以为中文, 也可以为json id
        initCity : null, //手动指定初始化城市, 可以为中文, 也可以为json id
        initDist : null, //手动指定初始化地区, 可以为中文, 也可以为json id
        withParentFirst : false, //是否在select第一个加上父类
        afterInit : function callback(selectedVals){}, //初始化后的回调函数, selectedVals参数为已选择值
        afterChange : function callback(selectedVals){}, //选择后的回调函数, selectedVals参数为已选择值
        jsonEmptyReplaceStr : {
            prov : '请选择省份',
            city : '请选择城市',
            dist : '请选择地区'
        }, //第一行空数据替换字符串
        jsonWithParentReplaceStr : {
            city : '全省',
            dist : '全市'
        }, //withParentFirst为true时替换字符串
        jsonAreasMainKeysMap : {
            prov : 'prov',
            city : 'city',
            dist : 'dist'
        }, //areas json数据的第一层键名映射
        jsonAreasSubKeysMap : {
            id : 'i',
            pid : 'p',
            name : 'n'
        }, //areas json每条数据的键名映射
        jsonServerIpKeysMap : {
            prov : 'province',
            city : 'city',
            dist : 'district'
        }, //server ip数据的键名映射
        jsonClientIpKeysMap : {
            prov : 'province',
            city : 'city',
            dist : 'district'
        } //client ip数据的键名映射
    };
