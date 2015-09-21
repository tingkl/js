A.setup({
 timeSign: '{%$tplData.timesign|escape:javascript%}',
 totalCount: '{%$totalCount|escape:javascript%}',
 city: '{%if $city%}{%$city|escape:javascript%}{%/if%}',
 district: '{%if $district%}{%$district|escape:javascript%}{%/if%}',
 area: '{%if $area%}{%$area|escape:javascript%}{%/if%}',
 ajaxUrl_s: '{%$ajaxUrl|ssl_url_r%}',
 img0Url: '{%$img0Url|escape:javascript%}',
 img0Url_s: '{%$img0Url|ssl_url_r%}',
 img1Url: '{%$img1Url|escape:javascript%}',
 img1Url_s: '{%$img1Url|ssl_url_r%}',
 img2Url: '{%$img2Url|escape:javascript%}',
 img2Url_s: '{%$img2Url|ssl_url_r%}'
});
A.setup(function() {
 var me = this;
 var config = {
  "city": {
   "hasTab": true,
   "countPerRow": 4,
   "$show": null,
   "needLoad": true,
   "data": null
  },
  "district": {
   "hasTab": false,
   "countPerRow": 4,
   "$show": null,
   "needLoad": true,
   "data": null
  },
  "area": {
   "hasTab": true,
   "countPerRow": 4,
   "$show": null,
   "needLoad": true,
   "data": null
  }
 };

 var $drop = me.find(".c-dropdown2");
 var $pager = me.find('.ecl-car-rent-pager');
 var $price = me.find('.c-tag-cont');
 var protocol = document.location.protocol;
 var cityFinished = false;
 var getCityData = function() {
  $.ajax({
   url: protocol + '//bs.baidu.com/adcoup-mat/27006_constants.js?',
   dataType: "jsonp",
   jsonpCallback: "ecl_car_rent_callback",
   timeout: 5000,
   success: function(data) {
    if (!data.data || !data.data[0]) {
     cityFinished = true;
     return;
    }
    data = data.data[0];
    if (data.cityData) {
     config.city.data = data.cityData;
    }
    if (data.districtData) {
     config.district.data = data.districtData;
    }
    if (data.areaData) {
     config.area.data = data.areaData;
    }
    cityFinished = true;
   }, //success
   error: function() {
    cityFinished = true;
   }
  }); //ajax
 }; //getCityData
 getCityData();

 var dataFinished = true;
 var exchangeData = function(nowPage) {
  dataFinished = false;
  var url;
  var freshPager;
  if (arguments.length > 0) {
   url = restructUrl(nowPage);
   freshPager = false;
  } else {
   url = restructUrl();
   freshPager = true;
  }
  var $content = me.find('.ecl-car-rent-content');
  var $more = me.find('.ecl-car-rent-more');
  var errFun = function() {
   $content.addClass('ecl-car-rent-hidden');
   $pager.addClass('ecl-car-rent-hidden');
   $more.removeClass("ecl-car-rent-hidden");
   dataFinished = true;
  };
  $.ajax({
   type: "GET",
   url: url,
   dataType: "jsonp",
   contentType: "application/json;charset=UTF-8",
   jsonp: "cb",
   timeout: 5000,
   success: function(data) {
    if (data.status !== 0 || !data.data || !data.data[0]) {
     errFun();
     return;
    }
    data = data.data[0];
    var pageNum = 0;
    var result = [];
    if (data.totalCount) {
     pageNum = parseInt(data.totalCount / 2) + data.totalCount % 2;
    }
    if (data.result) {
     result = data.result;
    }
    if (result.length === 0) {
     errFun();
    } else {
     $content.removeClass('ecl-car-rent-hidden');
     $more.addClass('ecl-car-rent-hidden');

     var html = '';
     for (var i = 0; i < result.length; i++) {
      var item = result[i];
      if (i === 0) {
       html += '<div class="c-row ecl-car-rent-first">';
      } else {
       html += '<div class="c-row ecl-car-rent-second">';
      }
      if (protocol.indexOf('https') >= 0) {
       item.poster.src = item.poster.src.replace(me.data.img0Url, me.data.img0Url_s);
       item.poster.src = item.poster.src.replace(me.data.img1Url, me.data.img1Url_s);
       item.poster.src = item.poster.src.replace(me.data.img2Url, me.data.img2Url_s);
      }
      html += '' + '<div class="c-span6 ecl-car-rent-img-cont">' + '<a class="ecl-car-rent-anti" target="_blank" href="' + item.poster.link + '" data-click="{\'title\':\'img\'}">' + '<img class="c-img c-img6 ecl-car-rent-img" src="' + item.poster.src + '">' + '</a>' + '<span class="ecl-car-rent-img-desc">' + limitlen(item.company, 18) + '</span>' + '</div>' + '<div class="c-span18 c-span-last">' + '<div class="c-row">' + '<a class="ecl-car-rent-desc-title ecl-car-rent-anti" target="_blank" href="' + item.title.link + '">' + limitlen(item.title.text + '（' + item.store + '）', 42) + '</a>' + '</div>' + '<div class="c-row">' + '<div class="c-span12">'
      for (var k in item.description) {
       var des = item.description[k];
       html += '' + '<div class="c-row ecl-car-rent-desc-gap-top">' + des.text + '：' + limitlen(des.value, 32) + '</div>';
      }
      html += '<div class="c-row ecl-car-rent-desc-gap-top">';
      for (var k in item.otherLink) {
       var link = item.otherLink[k];
       html += '<a class="ecl-car-rent-anti ecl-car-rent-desc-link c-gap-right" target="_blank" href="' + link.link + '">' + limitlen(link.text, 8) + '</a>';
      }
      html += '</div>' + '</div>' + '<div class="c-span6 c-span-last">' + '<div class="ecl-car-rent-right">' + '<div class="ecl-car-rent-right-price">' + '<span class="ecl-car-rent-pricesign">¥</span>' + item.price + '<span class="ecl-car-rent-pricetext">起</span>' + '</div>' + '<div class="c-gap-top-small">' + '<a class="ecl-car-rent-anti c-btn c-gap-top-small" target="_blank" href="' + item.detailLink + '">' + '查看详情' + '</a></div>' + '</div>' + '</div>' + '</div></div></div>';
     } //for

     if (pageNum > 1) {
      html += '<div class="c-row ecl-car-rent-gap15"></div>';
     } else {
      html += '<div class="c-row ecl-car-rent-gap6"></div>';
     }
     $content.html(html);

     if (freshPager) {
      if (pageNum > 1) {
       $pager.removeClass('ecl-car-rent-hidden');
       initPager(pageNum);
      } else {
       $pager.addClass('ecl-car-rent-hidden');
      }
     } else if ($pager.hasClass('ecl-car-rent-hidden')) {
      $pager.removeClass('ecl-car-rent-hidden');
      initPager(pageNum, nowPage);
     }
     dataFinished = true;
    } //else
   },
   error: function() {
    dataFinished = true;
   } //success
  }); //ajax
 }; //exchangeData

 var drop = {};
 var initDrop = function() {
  var $input = $drop.find(".c-dropdown2-btn");
  var $menu = $drop.find(".c-dropdown2-menubox");
  config.city.$show = $input.eq(0);
  config.district.$show = $input.eq(1);
  config.area.$show = $input.eq(2);
  A.use('dropdown21', function() {
   drop.city = A.ui.dropdown21($drop[0], {
    type: 'custom',
    vscrollbar: false,
    onopen: function() {
     if (!cityFinished) {
      drop.city.close();
      return;
     } else if (!config.city.data) {
      drop.city.close();
      cityFinished = false;
      getCityData();
      return;
     }
     if (config.city.data.length > 0) {
      if (config.city.needLoad) {
       var html = generateMenuHtml(config.city);
       $menu.eq(0).html(html);
       config.city.needLoad = false;
      }
     } else {
      drop.city.close();
     }
    }
   });
   drop.district = A.ui.dropdown21($drop[1], {
    type: 'custom',
    vscrollbar: false,
    onopen: function() {
     if (!cityFinished) {
      drop.district.close();
      return;
     } else if (!config.district.data) {
      drop.district.close();
      cityFinished = false;
      getCityData();
      return;
     }
     var dataSel = config.city.$show.attr("data-val");
     if (config.district.data[dataSel] && config.district.data[dataSel].length > 0) {
      if (config.district.needLoad) {
       var html = generateMenuHtml(config.district, dataSel);
       $menu.eq(1).html(html);
       config.district.needLoad = false;
      }
     } else {
      drop.district.close();
     }
    }
   });
   drop.area = A.ui.dropdown21($drop[2], {
    type: 'custom',
    vscrollbar: false,
    onopen: function() {
     if (!cityFinished) {
      drop.area.close();
      return;
     } else if (!config.area.data) {
      drop.area.close();
      cityFinished = false;
      getCityData();
      return;
     }
     var dataSel = config.district.$show.attr("data-val");
     if (dataSel !== '') {
      dataSel = config.city.$show.attr("data-val") + "-" + dataSel;
     }
     if (dataSel != '' && config.area.data[dataSel] && config.area.data[dataSel].length > 0) {
      if (config.area.needLoad) {
       var html = generateMenuHtml(config.area, dataSel);
       $menu.eq(2).html(html);
       config.area.needLoad = false;
      }
     } else {
      drop.area.close();
     }
    }
   });
  }); //A.use
 };
 var pager;
 var prePage = 1;
 var initPager = function(pageNum, curPage) {
  if (!curPage) {
   curPage = 1;
  }
  if (pageNum > 1) {
   A.use('page', function() {
    pager = A.ui.page($pager[0], curPage, pageNum, {
     prePageText: '上一页',
     nextPageText: '下一页',
     onChange: function(nowPage, endPage) {
      exchangeData(parseInt(nowPage) - 1);
     }
    });
   });
  }
 };
 me.dispose = function() {
  drop.city && drop.city.dispose && drop.city.dispose();
  drop.area && drop.area.dispose && drop.area.dispose();
  drop.district && drop.district.dispose && drop.district.dispose();
  pager && pager.dispose && pager.dispose();
 };

 var generateMenuHtml = function(configData, dataSel) {
  var hasTab = configData.hasTab;
  var tagSel = configData.$show.attr("data-val");
  var countPerRow = configData.countPerRow;
  var data;
  if (arguments.length > 1) {
   data = configData.data[dataSel];
  } else {
   data = configData.data;
  }

  var html = '';
  if (hasTab) {
   html += '<div class="c-clearfix ecl-car-rent-tabrow"><table><tr>';
   var tabLen = data.length;
   for (var i = 0; i < tabLen; i++) {
    var css = (i === 0 ? ' ecl-car-rent-tab-sel' : '');
    html += '<td class="ecl-car-rent-tabgap"><span class="ecl-car-rent-tab' + css + ' OP_LOG_BTN">' + data[i].tagName + '</span></td>';
   }
   html += '</tr></table></div>';

   for (var i = 0; i < tabLen; i++) {
    var css = (i === 0 ? '' : ' ecl-car-rent-hidden');
    html += '<div class="ecl-car-rent-listbox' + css + '">'
    html += generateListHtml(data[i].tags, true, countPerRow, tagSel);
    html += '</div>';
   }
  } else {
   html += '<div class="ecl-car-rent-listbox">'
   html += generateListHtml(data, false, countPerRow, tagSel);
   html += '</div>';
  }
  html += '';
  return html;
 };
 var generateListHtml = function(data, hasTab, countPerRow, tagSel) {
  var html = '<table><tr>';
  var i = 0;
  if (!hasTab) {
   var css = (tagSel === '' ? ' ecl-car-rent-list-sel' : '');
   html += '<td><span class="c-gap-right-small c-gap-bottom-small ecl-car-rent-list OP_LOG_BTN' + css + '" data-val="" >不限</span></td>';
   i++;
  }
  var tdLen = hasTab ? data.length : data.length + 1;
  var dataIdx = 0;
  for (; i < tdLen; i++, dataIdx++) {
   if ((i !== 0) && (i % countPerRow === 0)) {
    html += '</tr><tr>';
   }
   var css = (tagSel === data[dataIdx] ? ' ecl-car-rent-list-sel' : '');
   html += '<td><span class="c-gap-right-small c-gap-bottom-small ecl-car-rent-list OP_LOG_BTN' + css + '" data-val="' + data[dataIdx] + '">' + data[dataIdx] + '</span></td>';
  }
  var lastTd = i % countPerRow;
  if (lastTd !== 0) {
   for (i = lastTd; i < countPerRow; i++) {
    html += '<td>&nbsp;</td>';
   }
  }
  html += '</tr></table>';
  return html;
 };

 var initEvent = function() {
  $price.delegate('span', 'click', function() {
   if (!dataFinished || $(this).hasClass('c-tag-selected')) {
    return;
   }
   $(this).addClass('c-tag-selected').siblings('.c-tag-selected').removeClass('c-tag-selected');
   exchangeData();
  });
  $drop.delegate('.ecl-car-rent-tab', 'click', function() {
   var $this = $(this);
   if ($this.hasClass('ecl-car-rent-tab-sel')) {
    return;
   }
   var $fa = $this.parents('.c-dropdown2-menu');
   $fa.find('.ecl-car-rent-tab-sel').removeClass('ecl-car-rent-tab-sel');
   $this.addClass('ecl-car-rent-tab-sel');
   var $tab = $fa.find('.ecl-car-rent-tab');
   var nIndex = $tab.index($this);
   var $box = $fa.find('.ecl-car-rent-listbox');
   $box.eq(nIndex).removeClass('ecl-car-rent-hidden').siblings('.ecl-car-rent-listbox:visible').addClass('ecl-car-rent-hidden');
   var newWidth = $box.eq(nIndex).find("table").width() + 20;
   var oldWidth = $fa.width();
   if (newWidth > oldWidth) {
    $fa.css("width", newWidth + "px");
   }

  }).delegate('.ecl-car-rent-list', 'click', function(e) {
   var $this = $(this);
   if (!dataFinished) {
    return;
   }
   /*
    if ($this.hasClass('ecl-car-rent-list-sel')) {
    drop.city.close();
    drop.district.close();
    drop.area.close();
    return;
    }*/
   var $fa = $this.parents('.c-dropdown2');
   $fa.find('.ecl-car-rent-list-sel').removeClass('ecl-car-rent-list-sel');
   $this.addClass('ecl-car-rent-list-sel');
   var nIndex = $drop.index($fa);
   var nowVal = $this.attr('data-val');
   if (nIndex === 0) {
    config.city.$show.html(nowVal).attr('data-val', nowVal);
    config.district.needLoad = true;
    config.district.$show.html('不限').attr('data-val', '');
    config.area.needLoad = true;
    config.area.$show.html('请选择区域').attr('data-val', '').addClass('ecl-car-rent-gray');
    $price.find('span:first').addClass('c-tag-selected').siblings('.c-tag-selected').removeClass('c-tag-selected');
    drop.city.close();
   } else if (nIndex === 1) {
    if (nowVal === '') {
     config.district.$show.html('不限').attr('data-val', nowVal);
    } else {
     config.district.$show.html(nowVal).attr('data-val', nowVal);
    }
    config.area.needLoad = true;
    if (nowVal === '') {
     config.area.$show.html('请选择区域').attr('data-val', '').addClass('ecl-car-rent-gray');
    } else {
     config.area.$show.html('请选择商圈').attr('data-val', '').addClass('ecl-car-rent-gray');
    }
    drop.district.close();
   } else {
    config.area.$show.html(nowVal).attr('data-val', nowVal).removeClass('ecl-car-rent-gray');
    drop.area.close();
   }
   exchangeData();
  });
 };

 var restructUrl = function(nowPage) {
  var city = config.city.$show.attr("data-val");
  var district = config.district.$show.attr("data-val");
  var area = config.area.$show.attr("data-val");
  var price = $price.find(".c-tag-selected").attr("data-val");
  var page;
  if (arguments.length > 0) {
   page = nowPage;
  } else {
   page = 0;
  }

  var q_relation = '&relation=city_';
  var q_district = '';
  var q_area = '';
  var q_price = '';
  if (district != '') {
   q_relation += 'district_';
   q_district = '&district=' + district;
  }
  if (area != '') {
   q_relation += 'area_';
   q_area = '&area=' + area;
  }
  if (price != '') {
   q_relation += 'price_'
   q_price = '&price=' + price;
  }
  q_relation = q_relation.substr(0, q_relation.lastIndexOf('_'));

  var query = '' + 'query=' + '&ip=' + '&platform=0' + '&cookie=' + '&pageNo=' + encodeURIComponent(page) + '&pageSize=2' + '&eid=' + '&format=jsonp'
       //+ '&cb=cb'
      + '&sort=hot' + '&desc=1' + '&type=0' + '&srcId=27006' + '&tm=ecl_car_rent' + '&tn=baidu' + encodeURIComponent(q_relation) + '&city=' + encodeURIComponent(city) + encodeURIComponent(q_district) + encodeURIComponent(q_area) + encodeURIComponent(q_price) + '&encoding=utf8';
  /*var url = protocol;
   if (protocol.indexOf('https') >= 0) {
   url += '//sp1.baidu.com/9bMYfHSm2Q5IlBGlnYG/openapi?';
   } else {
   url += '//carp.baidu.com/openapi?'
   } */
  var url = me.data.ajaxUrl_s + '?';

  //url = 'http://cp01-rd-bu-09-rd028.cp01.baidu.com:8083/openapi?';
  url += query;
  return url;
 };

 var limitlen = function(str, len) {
  if (!len || len < 1 || !str || !str.length || str.length * 2 <= len) {
   return str;
  }
  var cur_str = '';
  var cur_len = 0;
  var i = 0;
  while (i < str.length && cur_len < len) {
   var ch = str.charAt(i);
   cur_str += ch;
   cur_len++;
   if (escape(ch).length > 4) {
    cur_len++;
   }
   i++;
  }
  if (cur_len > len) {
   cur_str = cur_str.substr(0, cur_str.length - 2) + '...';
  } else if (cur_len === len && i < str.length) {
   var ch = cur_str.charAt(cur_str.length - 1);
   if (escape(ch).length > 4) {
    cur_str = cur_str.substr(0, cur_str.length - 1) + '...';
   } else {
    cur_str = cur_str.substr(0, cur_str.length - 2) + '...';
   }
  }

  return cur_str;

 };
 initPager(parseInt(me.data.totalCount / 2) + me.data.totalCount % 2, 1);
 initDrop();
 initEvent();
});