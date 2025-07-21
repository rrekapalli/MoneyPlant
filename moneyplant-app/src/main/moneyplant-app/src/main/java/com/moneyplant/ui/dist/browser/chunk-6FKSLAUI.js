import{F as K,aa as Z,ia as G,ja as B,ma as J,oa as ee,q as d,s as f}from"./chunk-XBYO5J67.js";import{$a as X,Bb as I,Cb as H,Db as L,Eb as b,Fb as h,Fc as q,Gb as p,Jc as W,Ka as u,Kc as N,Nb as Q,Rc as j,S,T as E,Va as k,Vc as O,Wa as F,Wb as U,X as _,Za as A,aa as s,ba as a,cb as Y,jb as m,kb as x,lb as P,ma as C,qb as V,rb as v,sb as g,vc as $,wb as z,xb as R,zb as y}from"./chunk-E5FNFP2Z.js";var te=["content"],re=["container"],le=["xBar"],se=["yBar"],ae=["*"];function ce(i,ne){i&1&&H(0)}function ue(i,ne){i&1&&z(0)}var he=({dt:i})=>`
.p-scrollpanel-content-container {
    overflow: hidden;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
    float: left;
}

.p-scrollpanel-content {
    height: calc(100% + calc(2 * ${i("scrollpanel.bar.size")}));
    width: calc(100% + calc(2 * ${i("scrollpanel.bar.size")}));
    padding-inline: 0 calc(2 * ${i("scrollpanel.bar.size")});
    padding-block: 0 calc(2 * ${i("scrollpanel.bar.size")});
    position: relative;
    overflow: auto;
    box-sizing: border-box;
    scrollbar-width: none;
}

.p-scrollpanel-content::-webkit-scrollbar {
    display: none;
}

.p-scrollpanel-bar {
    position: relative;
    border-radius: ${i("scrollpanel.bar.border.radius")};
    z-index: 2;
    cursor: pointer;
    opacity: 0;
    outline-color: transparent;
    transition: outline-color ${i("scrollpanel.transition.duration")};
    background: ${i("scrollpanel.bar.background")};
    border: 0 none;
    transition: outline-color ${i("scrollpanel.transition.duration")}, opacity ${i("scrollpanel.transition.duration")};
}

.p-scrollpanel-bar:focus-visible {
    box-shadow: ${i("scrollpanel.bar.focus.ring.shadow")};
    outline: ${i("scrollpanel.barfocus.ring.width")} ${i("scrollpanel.bar.focus.ring.style")} ${i("scrollpanel.bar.focus.ring.color")};
    outline-offset: ${i("scrollpanel.barfocus.ring.offset")};
}

.p-scrollpanel-bar-y {
    width: ${i("scrollpanel.bar.size")};
    top: 0;
}

.p-scrollpanel-bar-x {
    height: ${i("scrollpanel.bar.size")};
    bottom: 0;
}

.p-scrollpanel-hidden {
    visibility: hidden;
}

.p-scrollpanel:hover .p-scrollpanel-bar,
.p-scrollpanel:active .p-scrollpanel-bar {
    opacity: 1;
}

.p-scrollpanel-grabbed {
    user-select: none;
}
`,pe={root:"p-scrollpanel p-component",contentContainer:"p-scrollpanel-content-container",content:"p-scrollpanel-content",barX:"p-scrollpanel-bar p-scrollpanel-bar-x",barY:"p-scrollpanel-bar p-scrollpanel-bar-y"},ie=(()=>{class i extends J{name="scrollpanel";theme=he;classes=pe;static \u0275fac=(()=>{let e;return function(t){return(e||(e=C(i)))(t||i)}})();static \u0275prov=S({token:i,factory:i.\u0275fac})}return i})();var de=(()=>{class i extends ee{style;styleClass;step=5;containerViewChild;contentViewChild;xBarViewChild;yBarViewChild;contentTemplate;templates;_contentTemplate;scrollYRatio;scrollXRatio;timeoutFrame=e=>setTimeout(e,0);initialized=!1;lastPageY;lastPageX;isXBarClicked=!1;isYBarClicked=!1;lastScrollLeft=0;lastScrollTop=0;orientation="vertical";timer;contentId;windowResizeListener;contentScrollListener;mouseEnterListener;xBarMouseDownListener;yBarMouseDownListener;documentMouseMoveListener;documentMouseUpListener;_componentStyle=_(ie);zone=_(Y);ngOnInit(){super.ngOnInit(),this.contentId=Z("pn_id_")+"_content"}ngAfterViewInit(){super.ngAfterViewInit(),O(this.platformId)&&this.zone.runOutsideAngular(()=>{this.moveBar(),this.moveBar=this.moveBar.bind(this),this.onXBarMouseDown=this.onXBarMouseDown.bind(this),this.onYBarMouseDown=this.onYBarMouseDown.bind(this),this.onDocumentMouseMove=this.onDocumentMouseMove.bind(this),this.onDocumentMouseUp=this.onDocumentMouseUp.bind(this),this.windowResizeListener=this.renderer.listen(window,"resize",this.moveBar),this.contentScrollListener=this.renderer.listen(this.contentViewChild.nativeElement,"scroll",this.moveBar),this.mouseEnterListener=this.renderer.listen(this.contentViewChild.nativeElement,"mouseenter",this.moveBar),this.xBarMouseDownListener=this.renderer.listen(this.xBarViewChild.nativeElement,"mousedown",this.onXBarMouseDown),this.yBarMouseDownListener=this.renderer.listen(this.yBarViewChild.nativeElement,"mousedown",this.onYBarMouseDown),this.calculateContainerHeight(),this.initialized=!0})}ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"content":this._contentTemplate=e.template;break;default:this._contentTemplate=e.template;break}})}calculateContainerHeight(){let e=this.containerViewChild.nativeElement,n=this.contentViewChild.nativeElement,t=this.xBarViewChild.nativeElement,o=this.document.defaultView,r=o.getComputedStyle(e),l=o.getComputedStyle(t),c=K(e)-parseInt(l.height,10);r["max-height"]!="none"&&c==0&&(n.offsetHeight+parseInt(l.height,10)>parseInt(r["max-height"],10)?e.style.height=r["max-height"]:e.style.height=n.offsetHeight+parseFloat(r.paddingTop)+parseFloat(r.paddingBottom)+parseFloat(r.borderTopWidth)+parseFloat(r.borderBottomWidth)+"px")}moveBar(){let e=this.containerViewChild.nativeElement,n=this.contentViewChild.nativeElement,t=this.xBarViewChild.nativeElement,o=n.scrollWidth,r=n.clientWidth,l=(e.clientHeight-t.clientHeight)*-1;this.scrollXRatio=r/o;let c=this.yBarViewChild.nativeElement,D=n.scrollHeight,T=n.clientHeight,oe=(e.clientWidth-c.clientWidth)*-1;this.scrollYRatio=T/D,this.requestAnimationFrame(()=>{if(this.scrollXRatio>=1)t.setAttribute("data-p-scrollpanel-hidden","true"),d(t,"p-scrollpanel-hidden");else{t.setAttribute("data-p-scrollpanel-hidden","false"),f(t,"p-scrollpanel-hidden");let w=Math.max(this.scrollXRatio*100,10),M=Math.abs(n.scrollLeft*(100-w)/(o-r));t.style.cssText="width:"+w+"%; inset-inline-start:"+M+"%;bottom:"+l+"px;"}if(this.scrollYRatio>=1)c.setAttribute("data-p-scrollpanel-hidden","true"),d(c,"p-scrollpanel-hidden");else{c.setAttribute("data-p-scrollpanel-hidden","false"),f(c,"p-scrollpanel-hidden");let w=Math.max(this.scrollYRatio*100,10),M=n.scrollTop*(100-w)/(D-T);c.style.cssText="height:"+w+"%; top: calc("+M+"% - "+t.clientHeight+"px); inset-inline-end:"+oe+"px;"}}),this.cd.markForCheck()}onScroll(e){this.lastScrollLeft!==e.target.scrollLeft?(this.lastScrollLeft=e.target.scrollLeft,this.orientation="horizontal"):this.lastScrollTop!==e.target.scrollTop&&(this.lastScrollTop=e.target.scrollTop,this.orientation="vertical"),this.moveBar()}onKeyDown(e){if(this.orientation==="vertical")switch(e.code){case"ArrowDown":{this.setTimer("scrollTop",this.step),e.preventDefault();break}case"ArrowUp":{this.setTimer("scrollTop",this.step*-1),e.preventDefault();break}case"ArrowLeft":case"ArrowRight":{e.preventDefault();break}default:break}else if(this.orientation==="horizontal")switch(e.code){case"ArrowRight":{this.setTimer("scrollLeft",this.step),e.preventDefault();break}case"ArrowLeft":{this.setTimer("scrollLeft",this.step*-1),e.preventDefault();break}case"ArrowDown":case"ArrowUp":{e.preventDefault();break}default:break}}onKeyUp(){this.clearTimer()}repeat(e,n){this.contentViewChild.nativeElement[e]+=n,this.moveBar()}setTimer(e,n){this.clearTimer(),this.timer=setTimeout(()=>{this.repeat(e,n)},40)}clearTimer(){this.timer&&clearTimeout(this.timer)}bindDocumentMouseListeners(){this.documentMouseMoveListener||(this.documentMouseMoveListener=e=>{this.onDocumentMouseMove(e)},this.document.addEventListener("mousemove",this.documentMouseMoveListener)),this.documentMouseUpListener||(this.documentMouseUpListener=e=>{this.onDocumentMouseUp(e)},this.document.addEventListener("mouseup",this.documentMouseUpListener))}unbindDocumentMouseListeners(){this.documentMouseMoveListener&&(this.document.removeEventListener("mousemove",this.documentMouseMoveListener),this.documentMouseMoveListener=null),this.documentMouseUpListener&&(document.removeEventListener("mouseup",this.documentMouseUpListener),this.documentMouseUpListener=null)}onYBarMouseDown(e){this.isYBarClicked=!0,this.yBarViewChild.nativeElement.focus(),this.lastPageY=e.pageY,this.yBarViewChild.nativeElement.setAttribute("data-p-scrollpanel-grabbed","true"),d(this.yBarViewChild.nativeElement,"p-scrollpanel-grabbed"),this.document.body.setAttribute("data-p-scrollpanel-grabbed","true"),d(this.document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()}onXBarMouseDown(e){this.isXBarClicked=!0,this.xBarViewChild.nativeElement.focus(),this.lastPageX=e.pageX,this.xBarViewChild.nativeElement.setAttribute("data-p-scrollpanel-grabbed","false"),d(this.xBarViewChild.nativeElement,"p-scrollpanel-grabbed"),this.document.body.setAttribute("data-p-scrollpanel-grabbed","false"),d(this.document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()}onDocumentMouseMove(e){this.isXBarClicked?this.onMouseMoveForXBar(e):this.isYBarClicked?this.onMouseMoveForYBar(e):(this.onMouseMoveForXBar(e),this.onMouseMoveForYBar(e))}onMouseMoveForXBar(e){let n=e.pageX-this.lastPageX;this.lastPageX=e.pageX,this.requestAnimationFrame(()=>{this.contentViewChild.nativeElement.scrollLeft+=n/this.scrollXRatio})}onMouseMoveForYBar(e){let n=e.pageY-this.lastPageY;this.lastPageY=e.pageY,this.requestAnimationFrame(()=>{this.contentViewChild.nativeElement.scrollTop+=n/this.scrollYRatio})}scrollTop(e){let n=this.contentViewChild.nativeElement.scrollHeight-this.contentViewChild.nativeElement.clientHeight;e=e>n?n:e>0?e:0,this.contentViewChild.nativeElement.scrollTop=e}onFocus(e){this.xBarViewChild.nativeElement.isSameNode(e.target)?this.orientation="horizontal":this.yBarViewChild.nativeElement.isSameNode(e.target)&&(this.orientation="vertical")}onBlur(){this.orientation==="horizontal"&&(this.orientation="vertical")}onDocumentMouseUp(e){this.yBarViewChild.nativeElement.setAttribute("data-p-scrollpanel-grabbed","false"),f(this.yBarViewChild.nativeElement,"p-scrollpanel-grabbed"),this.xBarViewChild.nativeElement.setAttribute("data-p-scrollpanel-grabbed","false"),f(this.xBarViewChild.nativeElement,"p-scrollpanel-grabbed"),this.document.body.setAttribute("data-p-scrollpanel-grabbed","false"),f(this.document.body,"p-scrollpanel-grabbed"),this.unbindDocumentMouseListeners(),this.isXBarClicked=!1,this.isYBarClicked=!1}requestAnimationFrame(e){(window.requestAnimationFrame||this.timeoutFrame)(e)}unbindListeners(){this.windowResizeListener&&(this.windowResizeListener(),this.windowResizeListener=null),this.contentScrollListener&&(this.contentScrollListener(),this.contentScrollListener=null),this.mouseEnterListener&&(this.mouseEnterListener(),this.mouseEnterListener=null),this.xBarMouseDownListener&&(this.xBarMouseDownListener(),this.xBarMouseDownListener=null),this.yBarMouseDownListener&&(this.yBarMouseDownListener(),this.yBarMouseDownListener=null)}ngOnDestroy(){this.initialized&&this.unbindListeners()}refresh(){this.moveBar()}static \u0275fac=(()=>{let e;return function(t){return(e||(e=C(i)))(t||i)}})();static \u0275cmp=k({type:i,selectors:[["p-scroll-panel"],["p-scrollPanel"],["p-scrollpanel"]],contentQueries:function(n,t,o){if(n&1&&(L(o,te,4),L(o,G,4)),n&2){let r;h(r=p())&&(t.contentTemplate=r.first),h(r=p())&&(t.templates=r)}},viewQuery:function(n,t){if(n&1&&(b(re,5),b(te,5),b(le,5),b(se,5)),n&2){let o;h(o=p())&&(t.containerViewChild=o.first),h(o=p())&&(t.contentViewChild=o.first),h(o=p())&&(t.xBarViewChild=o.first),h(o=p())&&(t.yBarViewChild=o.first)}},inputs:{style:"style",styleClass:"styleClass",step:[2,"step","step",$]},features:[U([ie]),A],ngContentSelectors:ae,decls:11,vars:17,consts:[["container",""],["content",""],["xBar",""],["yBar",""],[3,"ngClass","ngStyle"],[1,"p-scrollpanel-content-container"],[1,"p-scrollpanel-content",3,"mouseenter","scroll"],[4,"ngTemplateOutlet"],["tabindex","0","role","scrollbar",1,"p-scrollpanel-bar","p-scrollpanel-bar-x",3,"mousedown","keydown","keyup","focus","blur"],["tabindex","0","role","scrollbar",1,"p-scrollpanel-bar","p-scrollpanel-bar-y",3,"mousedown","keydown","keyup","focus"]],template:function(n,t){if(n&1){let o=R();I(),v(0,"div",4,0)(2,"div",5)(3,"div",6,1),y("mouseenter",function(){return s(o),a(t.moveBar())})("scroll",function(l){return s(o),a(t.onScroll(l))}),x(5,ce,1,0),X(6,ue,1,0,"ng-container",7),g()(),v(7,"div",8,2),y("mousedown",function(l){return s(o),a(t.onXBarMouseDown(l))})("keydown",function(l){return s(o),a(t.onKeyDown(l))})("keyup",function(){return s(o),a(t.onKeyUp())})("focus",function(l){return s(o),a(t.onFocus(l))})("blur",function(){return s(o),a(t.onBlur())}),g(),v(9,"div",9,3),y("mousedown",function(l){return s(o),a(t.onYBarMouseDown(l))})("keydown",function(l){return s(o),a(t.onKeyDown(l))})("keyup",function(){return s(o),a(t.onKeyUp())})("focus",function(l){return s(o),a(t.onFocus(l))}),g()()}n&2&&(Q(t.styleClass),V("ngClass","p-scrollpanel p-component")("ngStyle",t.style),m("data-pc-name","scrollpanel"),u(2),m("data-pc-section","wrapper"),u(),m("data-pc-section","content"),u(2),P(!t.contentTemplate&&!t._contentTemplate?5:-1),u(),V("ngTemplateOutlet",t.contentTemplate||t._contentTemplate),u(),m("aria-orientation","horizontal")("aria-valuenow",t.lastScrollLeft)("data-pc-section","barx")("aria-controls",t.contentId),u(2),m("aria-orientation","vertical")("aria-valuenow",t.lastScrollTop)("data-pc-section","bary")("aria-controls",t.contentId))},dependencies:[j,q,N,W,B],encapsulation:2,changeDetection:0})}return i})(),ke=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=F({type:i});static \u0275inj=E({imports:[de,B,B]})}return i})();export{de as a,ke as b};
