class menuHeader extends HTMLElement {
    accessToken = '';
    userData;
    constructor() {
        super();
    }
    connectedCallback() {
        this.setAccessToken();
        const div = document.createElement('div');
        div.id = "tmpDiv";
        const userMenu = this?.userData ? `<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">${this.userData['cognito:username']}<span class="caret"></span></a>
                                <ul class="dropdown-menu">
                                     <li><a href="?signout=true">Sign out</a></li>
                                </ul>` :
            `<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" style="background-color: orange;">Visitor<span class="caret"></span></a>
                                <ul class="dropdown-menu">
                                     <li><a href="https://devspot.auth.us-east-1.amazoncognito.com/login?client_id=6ua8mf7vk1eh8hqofll0ggshk3&response_type=token&scope=email+openid&redirect_uri=https://devspot.org/exam/catalog.html">Sign in</a></li>
                                     <li><a href="https://devspot.auth.us-east-1.amazoncognito.com/signup?client_id=6ua8mf7vk1eh8hqofll0ggshk3&response_type=token&scope=email+openid&redirect_uri=https://devspot.org/exam/catalog.html">Sign up</a></li>
                                </ul>`;
            div.innerHTML =
            `<template id="menu-template">
                <nav class="navbar navbar-fixed-top inbody">
                    <div class="container">
                        <div class="collapse navbar-collapse" id="topFixedNavbar1">
                            <div id="logo" class="fl_left">
                                <a href="/index.html#carousel1">
                                    <img src="/images/logo/Main-logo-png200px.png" href="/index.html#carousel1" class="logomain" alt="logo" longdesc="http://index.html"/>
                                </a>
                            </div>
                            <ul class="nav navbar-nav navbar-right text-uppercase">
                                <li><a href="/blog.html">Blog</a></li>
                                <li class="dropdown">
                                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                                       aria-expanded="false">Exam Simulator<span class="caret"></span></a>
                                    <ul class="dropdown-menu">
                                        <li><a href="/SAA-C02.html">Architect A.(SAA-C02)</a></li>
                                        <li><a href="/DVA-C01.html">Developer A.(DVA-C01)</a></li>
                                        <li><a href="/SOA-C01.html">SysOps A.(SOA-C01)</a></li>
                                    </ul>
                                </li>
                                <li class="dropdown">
                                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
                                    ${this?.userData ? '':'style="background-color: orange;"'} aria-expanded="false">My Tracks<span class="caret"></span></a>
                                    <ul class="dropdown-menu">
                                        <li><a href="/mytrack/SAA-C02.html">Architect A.(SAA-C02)</a></li>
                                        <li><a href="/mytrack/DVA-C01.html">Developer A.(DVA-C01)</a></li>
                                        <li><a href="/mytrack/SOA-C01.html">SysOps A.(SOA-C01)</a></li>
                                    </ul>
                                </li>
                                <li class="dropdown">
                                    ${userMenu}
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </template>`;
        document.body.append(div);
        const template = document.getElementById(`menu-template`);
        const node = document.importNode(template.content, true);
        document.body.removeChild(div);
        document.body.appendChild(node);
    }


    setAccessToken() {
        let id_token = getParameterByName('id_token');
        if (getParameterByName('signout'))
        {
            localStorage.setItem('accessToken','');
            this.accessToken = '';
            this.userData = '';
            window.location = location.protocol + '//' + location.host + location.pathname;
        } else {
            if (id_token) {
                localStorage.setItem('accessToken',id_token);
                this.accessToken = id_token;
                this.userData = parseJwt(id_token);
                window.location = location.protocol + '//' + location.host + location.pathname;
            } else {
                id_token = localStorage.getItem('accessToken');
                if (id_token) {
                    this.accessToken = localStorage.getItem('accessToken');
                    this.userData = parseJwt(this.accessToken);
                }
            }
        }
        localStorage.setItem('userData', JSON.stringify(this.userData));
        return;
    }
}
customElements.define('header-menu', menuHeader);

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[#?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return '';
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};