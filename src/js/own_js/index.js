/**
 * Created by txl91 on 2017/1/18.
 */
var token, user_id, version_time, get_time_stamp, hospital_name, hospital_id, days = 7;
var index = {
    hospital_list_tpl: _.template($('#hospital_list_tpl').html()),
    ready_init: function() {
        var self = this;
        var url = '<%=server_url%>/hos/';
        var verify = self.search_location('verify');
        $('.hospital-content').html('');
        $('.no-data-position').css('display', 'none');
        if (verify === 'login') {
            // self.setCookie('user_id', 2920,  location.pathname, location.hostname);
            document.title = '选择医院';
            var hospital_url = '<%=server_url%>/hos/get';
            token = self.getCookie('token');
            user_id = self.getCookie('user_id');
            self.dp_get( hospital_url,{ user_id: user_id }, '', function(result) {
                if (result.success) {
                    if (result.data.length) {
                        _.each(result.data, function(index) {
                            index.href_url = "<%=page_url%><%=cookie_path%>";
                            var hospital_list_tpl = self.hospital_list_tpl(index);
                            $('.hospital-content').append(hospital_list_tpl);
                        });
                        if (result.data.length === 1) {
                            self.hospital_list_focus($('.hospital-select-a').first());
                        }
                    }
                    else {
                        $('.no-data-position').find('.line2').text('该医院尚未开通大屏功能，或您的账号未关联医院');
                        $('.no-data-position').css('display', 'block');
                    }
                }
                else {
                    $('.no-data-position').find('.line2').text('出错啦！');
                    $('.no-data-position').css('display', 'block');
                }
            });
        }
        else {
          token = self.getCookie('token') || '';
          user_id = self.getCookie('user_id');
          hospital_name = self.getCookie('hospital_name');
          hospital_id = self.getCookie('hospital_id') || '';
          if (hospital_id) {
              if(token && user_id) {
                var login_url = '<%=server_url%>/login/insert';
                self.setCookie('hospital_name', hospital_name, '<%=cookie_path%>', '<%=cookie_ip%>');
                self.setCookie('hospital_id', hospital_id, '<%=cookie_path%>', '<%=cookie_ip%>');
                self.transmit_login(login_url, user_id, hospital_id, hospital_name, token)
              }
              else {
                self.dp_get( url,{}, '', function(result) {
                  if (result.success) {
                  }
                });
              }
          }
          else {
            self.dp_get( url,{}, '', function(result) {
              if (result.success) {
              }
            });
          }
        }
    },

    hospital_list_focus: function($obj) {
        var self = this;
        var id = $obj.attr('id');
        var name = $obj.data('name');
        var url = '<%=server_url%>/login/insert';
        token = self.getCookie('token');
        user_id = self.getCookie('user_id');
        self.transmit_login(url, user_id, id, name, token);
        self.setCookie('hospital_name', name, '<%=cookie_path%>', '<%=cookie_ip%>');
        self.setCookie('hospital_id', id, '<%=cookie_path%>', '<%=cookie_ip%>');
        self.setCookie('hospital_id', id, location.pathname, location.hostname, days);
        self.setCookie('hospital_name', name, location.pathname, location.hostname, days);
        //self.setCookie('token', token, '<%=cookie_path%>', '<%=cookie_ip%>');
        //self.setCookie('user_id', user_id, '<%=cookie_path%>', '<%=cookie_ip%>');
    },

    transmit_login: function (url, user_id, id, name, token) {
      var self = this;
      self.dp_post( url,{
        userId:user_id,
        hosId:id,
        hosName:name,
        token:token
      }, function(result) {
        version_time = new Date();
        get_time_stamp = version_time.getTime();
        window.location.assign("<%=page_url%><%=cookie_path%>" + "?time_stamp="+ get_time_stamp);
      });
    },

    search_location: function(key) {
        return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    },

    setCookie: function(name, value, path, domain, Days) {
        if (Days) {
          var exp = new Date();
          exp.setTime(exp.getTime() + Days*24*60*60*1000);
          document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + ";path="+ path +";domain=" +domain;
        }
        else {
          document.cookie = name + "="+ escape (value) + ";expires=" + (-1) + ";path="+ path +";domain=" +domain;
        }
    },

    getCookie: function(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg)){
            return unescape(arr[2]);
        }
        else{
            return null;
        }
    },

    dp_get: function(url, data, jsonpCall, callback){
        var dataType= jsonpCall ? 'jsonp': 'json';
        $.ajax({
            url:url,
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            dataType: dataType,
            data: data,
            jsonp: 'callback',
            jsonpCallback: jsonpCall,
            success: function(json) {
                if(json.url){
                    window.location.href = json.url;
                    return false;
                }
                if(!json.success) {
                    if (json.message) {
                        window.location.href = json.message;
                        return false;
                    }
                }
                if(typeof callback === 'function') {
                    callback(json);
                }
                dataType = null;
            },
            error: function(xhr, msg, error){
                console.log(xhr);
                console.log(error);
                console.log(msg);
            },
            complete: function(XHR, TS) {
                XHR = null;
            }
        })
    },

    dp_post: function(url, data, callback) {
        $.ajax({
            url:url,
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            dataType: 'json',
            contentType:'application/json',
            data:JSON.stringify(data),
            success: function(json) {
                if(!json.success) {
                    if (json.message) {
                        window.location.href = json.message;
                        return false;
                    }
                }
                if(typeof callback === 'function') {
                    callback(json);
                }
            },
            error: function(xhr, msg, error){
                console.log(xhr);
                console.log(error);
                console.log(msg);
            },
            complete: function(XHR, TS) {
                XHR = null;
            }
        })
    }
};

$(function() {
    index.ready_init();
}).on('click', '.hospital-select-a', function() {
    index.hospital_list_focus($(this));
})
;
