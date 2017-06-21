/**
 * Created by lukes on 2016/08/05
 * Updated by lukes on 2017/06/12
 */

var Lukerz8Pico = {
    cache: {},
    navbarScrollTimeout: 0,
    navbarScrollDelay: 50,
    navbarOnScroll: function() {
        if(Lukerz8Pico.navbarScrollTimeout) { clearTimeout(Lukerz8Pico.navbarScrollTimeout); }
        Lukerz8Pico.navbarScrollTimeout = setTimeout(Lukerz8Pico.collapseNavbar, Lukerz8Pico.navbarScrollDelay)
    },
    collapseNavbar: function() {
        if($(".navbar").offset().top > 50) {
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
            if (this.readyState === this.DONE) {
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
        if(typeof dir === 'string' &&
            (dir.toLowerCase() === 'work' || dir.toLowerCase() === 'personal')
        ){
            var url = '/assets/js/' + dir + '/' + configName + '.json';

            // Add date param to force clearing the browser cache
            url += '?dt=' + Date.now();

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.onload = function() {
                var status = xhr.status;
                if (status === 200) {
                    callback(null, xhr.response);
                } else {
                    callback(status, xhr.response);
                }
            };
            xhr.send();
        } else {
            callback('value of dir is invalid. Config file could not be retrieved.');
        }
    },
    getDashboardConfig: function(dir, configName, callback) {
        this.getJSONConfig(dir, configName, function(err, data) {
            if(!err) {
                console.log(data); // debug
                this.cache.dashboardConfig = data.config;
                this.cache.linkData = data.data;

                callback();
            } else { console.warn(err); }
        }.bind(this));
    },
    // Adds dashboard links from specified config file to specified element ID
    addDashboardLinksFromConfigTo: function(dir, elementID) {
        this.getDashboardConfig(dir, 'dashboard', function() {
            if(this.cache.hasOwnProperty('linkData') && this.cache.hasOwnProperty('dashboardConfig')) {
                this.sortLinkData();
                this.addLinkElementsTo(elementID);
            } else {
                if(!this.cache.hasOwnProperty('linkData')) {
                    console.warn('from Lukerz8Pico.addDashboardLinksFromConfig(): cache.linkData[] does not exist.');
                }
                if(!this.cache.hasOwnProperty('dashboardConfig')) {
                    console.warn('from Lukerz8Pico.addDashboardLinksFromConfig(): cache.dashboardConfig[] does not exist.');
                }
            }
        }.bind(this));
    },
    // Sort the links alphabetically by their title
    sortLinkData: function() {
        if(this.cache.hasOwnProperty('linkData')) {
            for(var linkType in this.cache.linkData) {
                this.cache.linkData[linkType].sort(function(a, b){
                    var nameA=a.title.toLowerCase(), nameB=b.title.toLowerCase();
                    if(nameA < nameB) { return -1; }
                    if(nameA > nameB) { return  1; }
                    return 0;
                });
            }
        } else {
            console.warn('from Lukerz8Pico.sortLinkData(): cache.linkData[] does not exist.');
        }
    },
    // Add the link elements to the specified container
    addLinkElementsTo: function(containerID) {
        var mainContainer = document.getElementById(containerID);

        if(mainContainer && this.cache.hasOwnProperty('linkData')) {
            var linkDataSize = Object.keys(this.cache.linkData).length;

            for(var linkType in this.cache.linkData) {
                // Create the title for the links of this type
                mainContainer.appendChild( this.getTitleElement(linkType) );

                // Create the container div for these link boxes
                var linksContainer = document.createElement('div');
                linksContainer.className = 'links-container';

                for(var linkId in  this.cache.linkData[linkType]) {
                    linksContainer.appendChild( this.getLinkEl(linkType, linkId) );
                }

                // We need to clear the floats after adding all the linkboxes
                linksContainer.appendChild( this.getClearFloatEl() );

                // Append the links container to the main container
                mainContainer.appendChild(linksContainer);

                if( (linkType + 1) < linkDataSize ) {
                    mainContainer.appendChild( document.createElement('hr') );
                }
            }
        } else {
            if(!mainContainer) {
                console.warn('from Lukerz8Pico.addLinkElementsTo(): element #' + containerID + ' does not exist.');
            }
            if(!this.cache.hasOwnProperty('linkData')) {
                console.warn('from Lukerz8Pico.addLinkElementsTo(): cache.linkData[] does not exist.');
            }
        }
    },
    getLinkEl: function(linkType, linkId) {
        if(this.cache.hasOwnProperty('linkData') && this.cache.hasOwnProperty('dashboardConfig')) {
            var logoTitle = this.getLogoTitle(this.cache.linkData[linkType][linkId].filename);

            // Create the parent li element
            var linkBox = document.createElement('a');
            linkBox.className = 'linkbox-item';
            linkBox.href = this.cache.linkData[linkType][linkId].href;
            linkBox.alt = logoTitle;
            linkBox.target = '_blank';

            // Create the img element
            var imgEl = document.createElement('img');
            imgEl.src = this.getSrcDirFor(linkType) + this.cache.linkData[linkType][linkId].filename + this.cache.dashboardConfig.imgExt;
            imgEl.title = logoTitle;

            // Create the title for this link box
            var titleEl = document.createElement('span');
            titleEl.innerHTML = this.cache.linkData[linkType][linkId].title;

            // Append the elements together
            linkBox.appendChild(imgEl);
            linkBox.appendChild(titleEl);

            return linkBox;
        } else {
            if(!this.cache.hasOwnProperty('linkData')) {
                console.warn('from Lukerz8Pico.getLinkEl(): cache.linkData[] does not exist.');
            }
            if(!this.cache.hasOwnProperty('dashboardConfig')) {
                console.warn('from Lukerz8Pico.getLinkEl(): cache.dashboardConfig[] does not exist.');
            }
        }
    },
    getTitleElement: function(title) {
        if(this.cache.hasOwnProperty('dashboardConfig')) {
            var titleEl = document.createElement(this.cache.dashboardConfig.titleElement);
            titleEl.className = 'link-type-title';
            titleEl.innerHTML = title;
            return titleEl;
        } else {
            console.warn('from Lukerz8Pico.getTitleElement(): cache.dashboardConfig[] does not exist.');
        }
    },
    getSrcDirFor: function(linkType) {
        if(this.cache.dashboardConfig.hasOwnProperty('srcDirs')) {
                 if(this.cache.dashboardConfig.srcDirs.hasOwnProperty(linkType))  { return this.cache.dashboardConfig.srcDirs[linkType];  }
            else if(this.cache.dashboardConfig.srcDirs.hasOwnProperty('Default')) { return this.cache.dashboardConfig.srcDirs['Default']; }
            else if(this.cache.dashboardConfig.srcDirs.hasOwnProperty('default')) { return this.cache.dashboardConfig.srcDirs['default']; }
        }
        else if(this.cache.dashboardConfig.hasOwnProperty('srcDir')) { return this.cache.dashboardConfig.srcDir; }
        // else
        return '/';
    },
    getLogoTitle: function(logoName) {
        if(logoName) {
            return logoName.replace(/[a-z]/, function(str) { return str.toUpperCase(); }) + ' Logo';
        } else {
            console.warn('from Lukerz8Pico.getLogoTitle(): Must specify logoName');
            return '? Logo';
        }
    },
    getClearFloatEl: function() {
        var clearDiv = document.createElement('div');
        clearDiv.style.clear = 'both';
        return clearDiv;
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
