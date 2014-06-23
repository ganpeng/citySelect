/**
 * citySelect, a jQuery plugin
 * https://github.com/tonylevid/citySelect
 * Author TonyLevid
 * Version 0.2
 * 城市选择
 * @param string provSelector jquery选择器, 省份目标元素, 为null则不选择
 * @param string citySelector jquery选择器, 城市目标元素, 为null则不选择
 * @param string distSelector jquery选择器, 区县目标元素, 为null则不选择
 * @param json citySelectOptions citySelect配置
 */
(function($) {
    var citySelect_jsonAreas = {};

    $.citySelect = function(provSelector, citySelector, distSelector, options) {
        var citySelectOptions = $.extend({}, $.citySelect.defaults, options);

        /**
         * 修复IE 6获取动态生成select option值时无法获取的bug
         * 请在插入option后调用, 如$(targetSelector).html(generatedOptions); fixSelectDelay(targetSelector);
         * @param string targetSelector jquery选择器, 目标元素
         * @return undefined
         */
        function fixSelectDelay(targetSelector) {
            if ($.browser.msie && parseInt($.browser.version) < 7) {
                $(targetSelector).each(function() {
                    this.offsetWidth; //只要获取一下有关宽高度的任何属性就可以解决ie6的问题_(:з」∠)_
                });
            }
        }

        /**
         * $.getScript with cache.
         * @param string url get script url
         * @param json options $.ajax options
         * @return object
         */
        function cachedScript(url, options) {
            // Allow user to set any option except for dataType, cache, and url
            options = $.extend(options || {}, {
                dataType : 'script',
                cache : true,
                url : url
            });
            // Use $.ajax() since it is more flexible than $.getScript
            // Return the jqXHR object so we can chain callbacks
            return $.ajax(options);
        };

        function citySelectRun(json) {
            var prov = citySelectOptions.jsonAreasMainKeysMap.prov;
            var city = citySelectOptions.jsonAreasMainKeysMap.city;
            var dist = citySelectOptions.jsonAreasMainKeysMap.dist;

            var id = citySelectOptions.jsonAreasSubKeysMap.id;
            var pid = citySelectOptions.jsonAreasSubKeysMap.pid;
            var name = citySelectOptions.jsonAreasSubKeysMap.name;

            if (!citySelectOptions.withParentFirst) {
                var emptyJson = {};
                $.each([json[prov], json[city], json[dist]], function(i, v) {
                    emptyJson[id] = 0;
                    emptyJson[pid] = 0;
                    emptyJson[name] = '--';
                    if (typeof(v) != 'undefined') {
                        var firstInArr = v.slice(0, 1);
                        var first = firstInArr.shift();
                        first[id] != 0 && v.unshift(emptyJson);
                    }
                })
            }

            var fillProv = function() {
                if (provSelector) {
                    var provOptionsHtml = '';
                    citySelectOptions.withParentFirst && (provOptionsHtml = '<option value="' + 0 +'" name="'+ citySelectOptions.jsonEmptyReplaceStr.prov + '">' + citySelectOptions.jsonEmptyReplaceStr.prov + '</option>');
                    $.each(json[prov], function(i, v) {
                        parseInt(v[id]) || (v[name] = citySelectOptions.jsonEmptyReplaceStr.prov);
                        provOptionsHtml +=
                        '<option value="' + v[id] +'" name="'+ v[name] + '">' + v[name] + '</option>';
                    });
                    if (provOptionsHtml) {
                        $(provSelector).show();
                        $(provSelector).html(provOptionsHtml);
                        fixSelectDelay(provSelector);
                    } else {
                        $(provSelector).html('<option value=""></option>').hide();
                    }
                }
            }

            var fillCity = function(selectProv) {
                if (citySelector) {
                    var cityOptionsHtml = '';
                    var optionName = selectProv == 0 ? citySelectOptions.jsonEmptyReplaceStr.city : citySelectOptions.jsonWithParentReplaceStr.city;
                    citySelectOptions.withParentFirst && (cityOptionsHtml = '<option value="' + selectProv +'" name="'+ optionName + '">' + optionName + '</option>');
                    $.each(json[city], function(i, v) {
                        if (v[pid] == selectProv) {
                            parseInt(v[id]) || (v[name] = citySelectOptions.jsonEmptyReplaceStr.city);
                            cityOptionsHtml +=
                            '<option value="' + v[id] +'" name="'+ v[name] + '">' + v[name] + '</option>';
                        }
                    });
                    if (cityOptionsHtml) {
                        $(citySelector).show();
                        $(citySelector).html(cityOptionsHtml);
                        fixSelectDelay(citySelector);
                    } else {
                        $(citySelector).html('<option value=""></option>').hide();
                    }
                }
            }

            var fillDist = function(selectCity) {
                if (distSelector) {
                    var distOptionsHtml = '';
                    var optionName = selectCity == 0 ? citySelectOptions.jsonEmptyReplaceStr.dist : citySelectOptions.jsonWithParentReplaceStr.dist;
                    citySelectOptions.withParentFirst && (distOptionsHtml = '<option value="' + selectCity +'" name="'+ optionName + '">' + optionName + '</option>');
                    $.each(json[dist], function(i, v) {
                        if (v[pid] == selectCity) {
                            parseInt(v[id]) || (v[name] = citySelectOptions.jsonEmptyReplaceStr.dist);
                            distOptionsHtml +=
                            '<option value="' + v[id] +'" name="'+ v[name] + '">' + v[name] + '</option>';
                        }
                    });
                    if (distOptionsHtml) {
                        $(distSelector).show();
                        $(distSelector).html(distOptionsHtml);
                        fixSelectDelay(distSelector);
                    } else {
                        $(distSelector).html('<option value=""></option>').hide();
                    }
                }
            }

            var getSelectVals = function() {
                var data = {};
                data[prov] = {};
                data[prov][id] = parseInt($(provSelector).val());
                data[prov][name] = $(provSelector).find('option').filter(':selected').attr('name');
                data[city] = {};
                data[city][id] = parseInt($(citySelector).val());
                data[city][name] = $(citySelector).find('option').filter(':selected').attr('name');
                data[dist] = {};
                data[dist][id] = parseInt($(distSelector).val());
                data[dist][name] = $(distSelector).find('option').filter(':selected').attr('name');
                return data;
            }

            var setSelectVals = function(provVal, cityVal, distVal) {
                $(provSelector).find('option[value="' + provVal + '"]').prop('selected', 'selected').end().change();
                $(citySelector).find('option[value="' + cityVal + '"]').prop('selected', 'selected').end().change();
                $(distSelector).find('option[value="' + distVal + '"]').prop('selected', 'selected');
            }

            var parseSelect = function(selector, parseVal) {
                var whichJSON = '';
                if (selector == provSelector && provSelector) {
                    whichJSON = json[prov];
                } else if (selector == citySelector && citySelector) {
                    whichJSON = json[city];
                } else if (selector == distSelector && distSelector) {
                    whichJSON = json[dist];
                } else {
                    whichJSON = {};
                }
                var returnId = null;
                $.each(whichJSON, function(i, v) {
                    if ( (v[id] == parseVal) || ( parseVal && (v[name].match(parseVal)) ) ) {
                        returnId = v[id];
                        return false;
                    }
                });
                return returnId;
            }

            // init
            var initFill = true;
            fillProv();
            $(provSelector).on('change', function() {
                $(provSelector).val($(this).val());
                fillCity($(this).val());
                fillDist($(citySelector).val());
                if (!initFill) {
                    typeof(citySelectOptions.afterChange) == 'function' && (citySelectOptions.afterChange(getSelectVals()));
                }
            });
            $(citySelector).on('change', function() {
                $(citySelector).val($(this).val());
                fillDist($(this).val());
                if (!initFill) {
                    typeof(citySelectOptions.afterChange) == 'function' && (citySelectOptions.afterChange(getSelectVals()));
                }
            });
            $(distSelector).on('change', function() {
                $(distSelector).val($(this).val());
                if (!initFill) {
                    typeof(citySelectOptions.afterChange) == 'function' && (citySelectOptions.afterChange(getSelectVals()));
                }
            });

            if (citySelectOptions.initByIp === 'server' && citySelectOptions.jsonServerIp) {
                $.getScript(citySelectOptions.jsonServerIp, function() {
                    // remote_ip_info is the json variable loaded from url citySelectOptions.jsonServerIp
                    var jsonServerIp = remote_ip_info; 
                    var ipProv = parseSelect(provSelector, jsonServerIp[citySelectOptions.jsonServerIpKeysMap.prov]);
                    var ipCity = parseSelect(citySelector, jsonServerIp[citySelectOptions.jsonServerIpKeysMap.city]);
                    var ipDist = parseSelect(distSelector, jsonServerIp[citySelectOptions.jsonServerIpKeysMap.dist]);
                    setSelectVals(ipProv, ipCity, ipDist);
                    typeof(citySelectOptions.afterInit) == 'function' && (citySelectOptions.afterInit(getSelectVals()));
                    initFill = false;
                });
            } else if (citySelectOptions.initByIp === 'client' && citySelectOptions.jsonClientIp) {
                $.getScript(citySelectOptions.jsonClientIp, function() {
                    // remote_ip_info is the json variable loaded from url citySelectOptions.jsonClientIp
                    var jsonClientIp = remote_ip_info;
                    var ipProv = parseSelect(provSelector, jsonClientIp[citySelectOptions.jsonClientIpKeysMap.prov]);
                    var ipCity = parseSelect(citySelector, jsonClientIp[citySelectOptions.jsonClientIpKeysMap.city]);
                    var ipDist = parseSelect(distSelector, jsonClientIp[citySelectOptions.jsonClientIpKeysMap.dist]);
                    setSelectVals(ipProv, ipCity, ipDist);
                    typeof(citySelectOptions.afterInit) == 'function' && (citySelectOptions.afterInit(getSelectVals()));
                    initFill = false;
                });
            } else {
                var initProv = parseSelect(provSelector, citySelectOptions.initProv);
                var initCity = parseSelect(citySelector, citySelectOptions.initCity);
                var initDist = parseSelect(distSelector, citySelectOptions.initDist);
                setSelectVals(initProv, initCity, initDist);
                typeof(citySelectOptions.afterInit) == 'function' && (citySelectOptions.afterInit(getSelectVals()));
                initFill = false;
            }
        }

        // load once
        var tmpArr = citySelectOptions.jsonAreas.replace(/\/+$/, '').split('/');
        var citySelect_jsonAreas_key = tmpArr[tmpArr.length - 1];
        if ($.isEmptyObject(citySelect_jsonAreas[citySelect_jsonAreas_key])) {
            cachedScript(citySelectOptions.jsonAreas, {
                success: function() {
                    var jsonAreas = citySelectMainData;
                    citySelect_jsonAreas[citySelect_jsonAreas_key] = jsonAreas;
                    citySelectRun(jsonAreas);
                }
            });
        } else {
            citySelectRun(citySelect_jsonAreas[citySelect_jsonAreas_key]);
        }

    }

    // plugin defaults
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
})(jQuery);