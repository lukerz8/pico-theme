/**
 * Created by lukes on 2016/08/05
 * Updated by lukes on 2017/05/31
 */

var Lukerz8Pico = {
    navbarScrollTimeout: 0,
    navbarScrollDelay: 50,
    navbarOnScroll: function() {
        if (Lukerz8Pico.navbarScrollTimeout) { clearTimeout(Lukerz8Pico.navbarScrollTimeout); }
        Lukerz8Pico.navbarScrollTimeout = setTimeout(Lukerz8Pico.collapseNavbar, Lukerz8Pico.navbarScrollDelay)
    },
    collapseNavbar: function() {
        if ($(".navbar").offset().top > 50) {
            $(".navbar-fixed-top").addClass("top-nav-collapse");
        } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
        }
    },
    getHostName: function() {
        return window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    },
    urlExists: function(url, callbackSuccess, callbackFail, callbackArg) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url);
        http.onreadystatechange = function() {
            if (this.readyState == this.DONE) {
                if (this.status === 200) {
                    if(callbackSuccess !== null) { callbackSuccess(callbackArg); }
                    else { return 0; }
                }
                else {
                    if(callbackFail !== null) { callbackFail(callbackArg); }
                    else { return -1; }
                }
            }
        };
        http.send();
    },
    getJSONConfig: function(dir, configName, callback) {
        if 	(typeof dir === 'string' &&
            (dir.toLowerCase() === 'work' || dir.toLowerCase() === 'personal')
        ){
            var url = '/assets/js/' + dir + '/' + configName + '.json';

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.onload = function() {
                var status = xhr.status;
                if (status == 200) {
                    callback(null, xhr.response);
                } else {
                    callback(status);
                }
            };
            xhr.send();
        } else {
            callback('value of dir is invalid. Config file could not be retrieved.');
        }
    },
    createTodayLinks: function() {
        var d = new Date();
        var yy = d.getFullYear();
        yy = yy.toString().substr(2);
        var mm = d.getMonth() + 1;
        if (mm < 10) { mm = '0' + mm; }
        var dd = d.getDate();
        if (dd < 10) { dd = '0' + dd; }

        if(document.getElementById("date-today-tsm")){
            document.getElementById("date-today-tsm").href = "/?/work/brain-dump/tsm-" + mm + dd + yy;
        }
        if(document.getElementById("date-today-personal")) {
            document.getElementById("date-today-personal").href = "/?/personal/brain-dump/me-" + mm + dd + yy;
        }

        // If a 0 is tacked on to the begining, dd is no longer an int.
        // So we have to subtract 1 day then add the 0 again.
        dd = d.getDate() - 1;
        if (dd < 10) { dd = '0' + dd; }

        if(document.getElementById("date-yest-tsm")) {
            document.getElementById("date-yest-tsm").href = "/?/work/brain-dump/tsm-" + mm + (dd) + yy;
        }
        if(document.getElementById("date-yest-personal")) {
            document.getElementById("date-yest-personal").href = "/?/personal/brain-dump/me-" + mm + (dd) + yy;
        }
    }
};



// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    if ($(this).attr('class') != 'dropdown-toggle active' && $(this).attr('class') != 'dropdown-toggle') {
        $('.navbar-toggle:visible').click();
    }
});

// Collapse navbar on scroll
window.addEventListener("wheel", Lukerz8Pico.navbarOnScroll);

// Check for and create Today Links
document.addEventListener("DOMContentLoaded", function() {
    Lukerz8Pico.collapseNavbar();
    Lukerz8Pico.createTodayLinks();
});
