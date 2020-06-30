class postsSidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.shadowRoot.innerHTML =
            `<template id="sidebar-template">
                <link href="layout/styles/layout.css" rel="stylesheet" type="text/css" media="all">
                <link href="css/bootstrap.css" rel="stylesheet">
                <link href="css/style.css" rel="stylesheet" type="text/css">
                <div>
                    <h3 class="section-title">Popular Posts</h3>
                </div>
    
                <div class="trend-entry d-flex">
                    <div class="trend-contents">
                        <h4><a href="blog-01.html">My journey to become an AWS Certified Solutions Architect Associate</a></h4>
                        <div class="post-meta">
                            <span class="d-block"><a href="#">Gustavo Carrion</a></span>
                            <span class="date-read">Jun 14 <span class="mx-1">•</span> 3 min read <span class="icon-star2"></span></span>
                        </div>
                    </div>
                </div>
                <div class="trend-entry d-flex">
                    <div class="trend-contents">
                        <h4><a href="blog-02.html">My thoughts on the AWS Certified Developer Associate exam</a></h4>
                        <div class="post-meta">
                            <span class="d-block"><a href="#">Gustavo Carrion</a></span>
                            <span class="date-read">Jun 14 <span class="mx-1">•</span> 3 min read <span class="icon-star2"></span></span>
                        </div>
                    </div>
                </div>
            </template>`;
        const template = this.shadowRoot.getElementById('sidebar-template');
        const node = document.importNode(template.content, true);
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(node);
    }
}
customElements.define('sidebar-posts', postsSidebar);