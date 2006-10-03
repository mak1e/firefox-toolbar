function FacebookRestClient() {
    this.settings = Components.classes['@facebook.com/simple-service;1']
                              .getService()
                              .QueryInterface(Components.interfaces.fbISimpleFacebookService);
}

FacebookRestClient.prototype = {
    generateSig: function (params, useSessionSecret) {
        var str = '';
        params.sort();
        for (var i = 0; i < params.length; i++) {
            str += params[i];
        }
        if (useSessionSecret) {
            str += this.settings.sessionSecret;
        } else {
            str += this.settings.secret;
        }
        return MD5(str);
    },
    callMethod: function (method, params, callback) {
        params.push('method=' + method);
        params.push('session_key=' + this.settings.sessionKey);
        params.push('api_key=' + this.settings.apiKey);
        params.push('call_id=' + (new Date()).getTime());
        params.push('sig=' + this.generateSig(params, method.indexOf('facebook.auth')));

        var req = new XMLHttpRequest();
        req.onreadystatechange = function (event) {
            if (req.readyState == 4) {
                var status;
                try {
                    status = req.status;
                } catch (e) {
                    status = 0;
                }

                if (status == 200) {
                    req.text = req.responseText.substr(req.responseText.indexOf("\n"));
                    req.xmldata = new XML(req.text);
                    callback(req);
                }
            }
        };
        try {
            req.open('POST', 'http://api.dev005.facebook.com:4750/restserver.php', true);
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            req.send(params.join('&'));
        } catch (e) {
            dump(e);
        }
    },
}
dump('loaded facebook.js\n');