/**
 * Created by txl91 on 2017/1/18.
 */
var token, user_id;
var index = {
    hospital_list_tpl: _.template($('#hospital_list_tpl').html()),
    ready_init: function() {
        var self = this;
        var url = '<%=server_url%>/dp/hos/';
        var verify = self.search_location('verify');
        $('.hospital-content').html('');
        if (verify === 'login') {
            var hospital_url = '<%=server_url%>/dp/hos/get';
            token = self.getCookie('token');
            user_id = self.getCookie('user_id');
            self.dp_get( hospital_url,{ user_id: user_id }, '', function(result) {
                if (result.success) {
                    _.each(result.data, function(index) {
                        var hospital_list_tpl = self.hospital_list_tpl(index);
                        $('.hospital-content').append(hospital_list_tpl);
                    });
                    if (result.data.length === 1) {
                        self.hospital_list_focus($('.hospital-select-a').first());
                        window.location.href = "<%=page_url%><%=cookie_path%>/";
                    }
                }
            });
        }
        else {
            self.dp_get( url,{}, '', function(result) {
                if (result.success) {
                }
            });
        }
    },

    hospital_list_focus: function($obj) {
        var self = this;
        var id = $obj.attr('id');
        var name = $obj.data('name');
        token = self.getCookie('token');
        user_id = self.getCookie('user_id');
        self.setCookie('hospital_name', name, '<%=cookie_path%>', '<%=cookie_ip%>');
        self.setCookie('hospital_id', id, '<%=cookie_path%>', '<%=cookie_ip%>');
        self.setCookie('token', token, '<%=cookie_path%>', '<%=cookie_ip%>');
        self.setCookie('user_id', user_id, '<%=cookie_path%>', '<%=cookie_ip%>');
    },

    search_location: function(key) {
        return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    },

    setCookie: function(name, value, path, domain) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        document.cookie = name + "="+ escape (value) + ";expires=" + (-1) + ";path="+ path +";domain=" +domain;
        //document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + ";path="+ path +";domain=" +domain;
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
                    }
                    return false;
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
    }
};

$(function() {
    index.ready_init();
}).on('click', '.hospital-select-a', function() {
    index.hospital_list_focus($(this));
})
;
