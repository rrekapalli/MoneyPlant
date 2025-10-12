import{b as ft,c as vt}from"./chunk-E2A6ZCMF.js";import{B as O,N as Z,T as ut,ba as pt,ca as tt,fa as C,g as X,ha as F,j as ct,na as et,oa as ht,q as dt,r as bt,s as E,y as Y}from"./chunk-IDZOVNAK.js";import{Ab as Q,Bb as D,Cb as b,Da as f,Db as u,Kb as l,Nc as lt,Oa as m,Pa as it,Ra as y,Sa as ot,T as I,Ta as U,U as g,Uc as k,V as nt,Vb as B,Yc as H,Z as s,bb as d,ca as P,da as S,db as _,ea as W,eb as T,jb as G,kb as N,la as A,lb as R,lc as r,mb as j,mc as rt,pa as c,pc as h,ra as at,rc as K,sb as J,tb as z,uc as M,vb as L,vc as st,xb as v,yb as x,zb as w}from"./chunk-53IN4TFO.js";var gt=`
    .p-tabs {
        display: flex;
        flex-direction: column;
    }

    .p-tablist {
        display: flex;
        position: relative;
        overflow: hidden;
    }

    .p-tablist-viewport {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        scrollbar-width: none;
        overscroll-behavior: contain auto;
    }

    .p-tablist-viewport::-webkit-scrollbar {
        display: none;
    }

    .p-tablist-tab-list {
        position: relative;
        display: flex;
        background: dt('tabs.tablist.background');
        border-style: solid;
        border-color: dt('tabs.tablist.border.color');
        border-width: dt('tabs.tablist.border.width');
    }

    .p-tablist-content {
        flex-grow: 1;
    }

    .p-tablist-nav-button {
        all: unset;
        position: absolute !important;
        flex-shrink: 0;
        inset-block-start: 0;
        z-index: 2;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: dt('tabs.nav.button.background');
        color: dt('tabs.nav.button.color');
        width: dt('tabs.nav.button.width');
        transition:
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        box-shadow: dt('tabs.nav.button.shadow');
        outline-color: transparent;
        cursor: pointer;
    }

    .p-tablist-nav-button:focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.nav.button.focus.ring.shadow');
        outline: dt('tabs.nav.button.focus.ring.width') dt('tabs.nav.button.focus.ring.style') dt('tabs.nav.button.focus.ring.color');
        outline-offset: dt('tabs.nav.button.focus.ring.offset');
    }

    .p-tablist-nav-button:hover {
        color: dt('tabs.nav.button.hover.color');
    }

    .p-tablist-prev-button {
        inset-inline-start: 0;
    }

    .p-tablist-next-button {
        inset-inline-end: 0;
    }

    .p-tablist-prev-button:dir(rtl),
    .p-tablist-next-button:dir(rtl) {
        transform: rotate(180deg);
    }

    .p-tab {
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        position: relative;
        border-style: solid;
        white-space: nowrap;
        gap: dt('tabs.tab.gap');
        background: dt('tabs.tab.background');
        border-width: dt('tabs.tab.border.width');
        border-color: dt('tabs.tab.border.color');
        color: dt('tabs.tab.color');
        padding: dt('tabs.tab.padding');
        font-weight: dt('tabs.tab.font.weight');
        transition:
            background dt('tabs.transition.duration'),
            border-color dt('tabs.transition.duration'),
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        margin: dt('tabs.tab.margin');
        outline-color: transparent;
    }

    .p-tab:not(.p-disabled):focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.tab.focus.ring.shadow');
        outline: dt('tabs.tab.focus.ring.width') dt('tabs.tab.focus.ring.style') dt('tabs.tab.focus.ring.color');
        outline-offset: dt('tabs.tab.focus.ring.offset');
    }

    .p-tab:not(.p-tab-active):not(.p-disabled):hover {
        background: dt('tabs.tab.hover.background');
        border-color: dt('tabs.tab.hover.border.color');
        color: dt('tabs.tab.hover.color');
    }

    .p-tab-active {
        background: dt('tabs.tab.active.background');
        border-color: dt('tabs.tab.active.border.color');
        color: dt('tabs.tab.active.color');
    }

    .p-tabpanels {
        background: dt('tabs.tabpanel.background');
        color: dt('tabs.tabpanel.color');
        padding: dt('tabs.tabpanel.padding');
        outline: 0 none;
    }

    .p-tabpanel:focus-visible {
        box-shadow: dt('tabs.tabpanel.focus.ring.shadow');
        outline: dt('tabs.tabpanel.focus.ring.width') dt('tabs.tabpanel.focus.ring.style') dt('tabs.tabpanel.focus.ring.color');
        outline-offset: dt('tabs.tabpanel.focus.ring.offset');
    }

    .p-tablist-active-bar {
        z-index: 1;
        display: block;
        position: absolute;
        inset-block-end: dt('tabs.active.bar.bottom');
        height: dt('tabs.active.bar.height');
        background: dt('tabs.active.bar.background');
        transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
    }
`;var Dt=["previcon"],Bt=["nexticon"],Mt=["content"],kt=["prevButton"],Ct=["nextButton"],Ft=["inkbar"],It=["tabs"],V=["*"];function Nt(e,p){e&1&&J(0)}function Lt(e,p){if(e&1&&U(0,Nt,1,0,"ng-container",11),e&2){let t=v(2);G("ngTemplateOutlet",t.prevIconTemplate||t._prevIconTemplate)}}function Et(e,p){e&1&&(W(),j(0,"svg",10))}function Ot(e,p){if(e&1){let t=z();N(0,"button",9,3),L("click",function(){P(t);let n=v();return S(n.onPrevButtonClick())}),_(2,Lt,1,1,"ng-container")(3,Et,1,0,":svg:svg",10),R()}if(e&2){let t=v();l(t.cx("prevButton")),d("aria-label",t.prevButtonAriaLabel)("tabindex",t.tabindex())("data-pc-group-section","navigator"),f(2),T(t.prevIconTemplate||t._prevIconTemplate?2:3)}}function Vt(e,p){e&1&&J(0)}function Pt(e,p){if(e&1&&U(0,Vt,1,0,"ng-container",11),e&2){let t=v(2);G("ngTemplateOutlet",t.nextIconTemplate||t._nextIconTemplate)}}function St(e,p){e&1&&(W(),j(0,"svg",12))}function At(e,p){if(e&1){let t=z();N(0,"button",9,4),L("click",function(){P(t);let n=v();return S(n.onNextButtonClick())}),_(2,Pt,1,1,"ng-container")(3,St,1,0,":svg:svg",12),R()}if(e&2){let t=v();l(t.cx("nextButton")),d("aria-label",t.nextButtonAriaLabel)("tabindex",t.tabindex())("data-pc-group-section","navigator"),f(2),T(t.nextIconTemplate||t._nextIconTemplate?2:3)}}function Rt(e,p){e&1&&w(0)}var jt={root:({instance:e})=>["p-tabs p-component",{"p-tabs-scrollable":e.scrollable()}]},mt=(()=>{class e extends C{name="tabs";theme=gt;classes=jt;static \u0275fac=(()=>{let t;return function(n){return(t||(t=c(e)))(n||e)}})();static \u0275prov=g({token:e,factory:e.\u0275fac})}return e})();var zt={root:"p-tablist",content:({instance:e})=>["p-tablist-content",{"p-tablist-viewport":e.scrollable()}],tabList:"p-tablist-tab-list",activeBar:"p-tablist-active-bar",prevButton:"p-tablist-prev-button p-tablist-nav-button",nextButton:"p-tablist-next-button p-tablist-nav-button"},yt=(()=>{class e extends C{name="tablist";classes=zt;static \u0275fac=(()=>{let t;return function(n){return(t||(t=c(e)))(n||e)}})();static \u0275prov=g({token:e,factory:e.\u0275fac})}return e})();var wt=(()=>{class e extends F{prevIconTemplate;nextIconTemplate;templates;content;prevButton;nextButton;inkbar;tabs;pcTabs=s(I(()=>$));isPrevButtonEnabled=A(!1);isNextButtonEnabled=A(!1);resizeObserver;showNavigators=r(()=>this.pcTabs.showNavigators());tabindex=r(()=>this.pcTabs.tabindex());scrollable=r(()=>this.pcTabs.scrollable());_componentStyle=s(yt);constructor(){super(),rt(()=>{this.pcTabs.value(),H(this.platformId)&&setTimeout(()=>{this.updateInkBar()})})}get prevButtonAriaLabel(){return this.config.translation.aria.previous}get nextButtonAriaLabel(){return this.config.translation.aria.next}ngAfterViewInit(){super.ngAfterViewInit(),this.showNavigators()&&H(this.platformId)&&(this.updateButtonState(),this.bindResizeObserver())}_prevIconTemplate;_nextIconTemplate;ngAfterContentInit(){this.templates.forEach(t=>{switch(t.getType()){case"previcon":this._prevIconTemplate=t.template;break;case"nexticon":this._nextIconTemplate=t.template;break}})}ngOnDestroy(){this.unbindResizeObserver(),super.ngOnDestroy()}onScroll(t){this.showNavigators()&&this.updateButtonState(),t.preventDefault()}onPrevButtonClick(){let t=this.content.nativeElement,a=O(t),n=Math.abs(t.scrollLeft)-a,i=n<=0?0:n;t.scrollLeft=X(t)?-1*i:i}onNextButtonClick(){let t=this.content.nativeElement,a=O(t)-this.getVisibleButtonWidths(),n=t.scrollLeft+a,i=t.scrollWidth-a,o=n>=i?i:n;t.scrollLeft=X(t)?-1*o:o}updateButtonState(){let t=this.content?.nativeElement,a=this.el?.nativeElement,{scrollWidth:n,offsetWidth:i}=t,o=Math.abs(t.scrollLeft),q=O(t);this.isPrevButtonEnabled.set(o!==0),this.isNextButtonEnabled.set(a.offsetWidth>=i&&o!==n-q)}updateInkBar(){let t=this.content?.nativeElement,a=this.inkbar?.nativeElement,n=this.tabs?.nativeElement,i=dt(t,'[data-pc-name="tab"][data-p-active="true"]');a&&(a.style.width=ct(i)+"px",a.style.left=Y(i).left-Y(n).left+"px")}getVisibleButtonWidths(){let t=this.prevButton?.nativeElement,a=this.nextButton?.nativeElement;return[t,a].reduce((n,i)=>i?n+O(i):n,0)}bindResizeObserver(){this.resizeObserver=new ResizeObserver(()=>this.updateButtonState()),this.resizeObserver.observe(this.el.nativeElement)}unbindResizeObserver(){this.resizeObserver&&(this.resizeObserver.unobserve(this.el.nativeElement),this.resizeObserver=null)}static \u0275fac=function(a){return new(a||e)};static \u0275cmp=m({type:e,selectors:[["p-tablist"]],contentQueries:function(a,n,i){if(a&1&&(Q(i,Dt,4),Q(i,Bt,4),Q(i,pt,4)),a&2){let o;b(o=u())&&(n.prevIconTemplate=o.first),b(o=u())&&(n.nextIconTemplate=o.first),b(o=u())&&(n.templates=o)}},viewQuery:function(a,n){if(a&1&&(D(Mt,5),D(kt,5),D(Ct,5),D(Ft,5),D(It,5)),a&2){let i;b(i=u())&&(n.content=i.first),b(i=u())&&(n.prevButton=i.first),b(i=u())&&(n.nextButton=i.first),b(i=u())&&(n.inkbar=i.first),b(i=u())&&(n.tabs=i.first)}},hostVars:3,hostBindings:function(a,n){a&2&&(d("data-pc-name","tablist"),l(n.cx("root")))},features:[B([yt]),y],ngContentSelectors:V,decls:9,vars:9,consts:[["content",""],["tabs",""],["inkbar",""],["prevButton",""],["nextButton",""],["type","button","pRipple","",3,"class"],[3,"scroll"],["role","tablist"],["role","presentation"],["type","button","pRipple","",3,"click"],["data-p-icon","chevron-left"],[4,"ngTemplateOutlet"],["data-p-icon","chevron-right"]],template:function(a,n){if(a&1){let i=z();x(),_(0,Ot,4,6,"button",5),N(1,"div",6,0),L("scroll",function(q){return P(i),S(n.onScroll(q))}),N(3,"div",7,1),w(5),j(6,"span",8,2),R()(),_(8,At,4,6,"button",5)}a&2&&(T(n.showNavigators()&&n.isPrevButtonEnabled()?0:-1),f(),l(n.cx("content")),f(2),l(n.cx("tabList")),f(3),l(n.cx("activeBar")),d("data-pc-section","inkbar"),f(2),T(n.showNavigators()&&n.isNextButtonEnabled()?8:-1))},dependencies:[k,lt,ft,vt,ht,et,tt],encapsulation:2,changeDetection:0})}return e})(),Qt={root:({instance:e})=>["p-tab",{"p-tab-active":e.active(),"p-disabled":e.disabled()}]},_t=(()=>{class e extends C{name="tab";classes=Qt;static \u0275fac=(()=>{let t;return function(n){return(t||(t=c(e)))(n||e)}})();static \u0275prov=g({token:e,factory:e.\u0275fac})}return e})();var Kt=(()=>{class e extends F{value=K();disabled=h(!1,{transform:M});pcTabs=s(I(()=>$));pcTabList=s(I(()=>wt));el=s(at);_componentStyle=s(_t);ripple=r(()=>this.config.ripple());id=r(()=>`${this.pcTabs.id()}_tab_${this.value()}`);ariaControls=r(()=>`${this.pcTabs.id()}_tabpanel_${this.value()}`);active=r(()=>Z(this.pcTabs.value(),this.value()));tabindex=r(()=>this.active()?this.pcTabs.tabindex():-1);mutationObserver;onFocus(t){this.pcTabs.selectOnFocus()&&this.changeActiveValue()}onClick(t){this.changeActiveValue()}onKeyDown(t){switch(t.code){case"ArrowRight":this.onArrowRightKey(t);break;case"ArrowLeft":this.onArrowLeftKey(t);break;case"Home":this.onHomeKey(t);break;case"End":this.onEndKey(t);break;case"PageDown":this.onPageDownKey(t);break;case"PageUp":this.onPageUpKey(t);break;case"Enter":case"NumpadEnter":case"Space":this.onEnterKey(t);break;default:break}t.stopPropagation()}ngAfterViewInit(){super.ngAfterViewInit(),this.bindMutationObserver()}onArrowRightKey(t){let a=this.findNextTab(t.currentTarget);a?this.changeFocusedTab(t,a):this.onHomeKey(t),t.preventDefault()}onArrowLeftKey(t){let a=this.findPrevTab(t.currentTarget);a?this.changeFocusedTab(t,a):this.onEndKey(t),t.preventDefault()}onHomeKey(t){let a=this.findFirstTab();this.changeFocusedTab(t,a),t.preventDefault()}onEndKey(t){let a=this.findLastTab();this.changeFocusedTab(t,a),t.preventDefault()}onPageDownKey(t){this.scrollInView(this.findLastTab()),t.preventDefault()}onPageUpKey(t){this.scrollInView(this.findFirstTab()),t.preventDefault()}onEnterKey(t){this.changeActiveValue(),t.preventDefault()}findNextTab(t,a=!1){let n=a?t:t.nextElementSibling;return n?E(n,"data-p-disabled")||E(n,"data-pc-section")==="inkbar"?this.findNextTab(n):n:null}findPrevTab(t,a=!1){let n=a?t:t.previousElementSibling;return n?E(n,"data-p-disabled")||E(n,"data-pc-section")==="inkbar"?this.findPrevTab(n):n:null}findFirstTab(){return this.findNextTab(this.pcTabList?.tabs?.nativeElement?.firstElementChild,!0)}findLastTab(){return this.findPrevTab(this.pcTabList?.tabs?.nativeElement?.lastElementChild,!0)}changeActiveValue(){this.pcTabs.updateValue(this.value())}changeFocusedTab(t,a){bt(a),this.scrollInView(a)}scrollInView(t){t?.scrollIntoView?.({block:"nearest"})}bindMutationObserver(){H(this.platformId)&&(this.mutationObserver=new MutationObserver(t=>{t.forEach(()=>{this.active()&&this.pcTabList?.updateInkBar()})}),this.mutationObserver.observe(this.el.nativeElement,{childList:!0,characterData:!0,subtree:!0}))}unbindMutationObserver(){this.mutationObserver.disconnect()}ngOnDestroy(){this.mutationObserver&&this.unbindMutationObserver(),super.ngOnDestroy()}static \u0275fac=(()=>{let t;return function(n){return(t||(t=c(e)))(n||e)}})();static \u0275cmp=m({type:e,selectors:[["p-tab"]],hostVars:10,hostBindings:function(a,n){a&1&&L("focus",function(o){return n.onFocus(o)})("click",function(o){return n.onClick(o)})("keydown",function(o){return n.onKeyDown(o)}),a&2&&(d("data-pc-name","tab")("id",n.id())("aria-controls",n.ariaControls())("role","tab")("aria-selected",n.active())("data-p-disabled",n.disabled())("data-p-active",n.active())("tabindex",n.tabindex()),l(n.cx("root")))},inputs:{value:[1,"value"],disabled:[1,"disabled"]},outputs:{value:"valueChange"},features:[B([_t]),ot([et]),y],ngContentSelectors:V,decls:1,vars:0,template:function(a,n){a&1&&(x(),w(0))},dependencies:[k,tt],encapsulation:2,changeDetection:0})}return e})(),Ht={root:({instance:e})=>["p-tabpanel",{"p-tabpanel-active":e.active()}]},Tt=(()=>{class e extends C{name="tabpanel";classes=Ht;static \u0275fac=(()=>{let t;return function(n){return(t||(t=c(e)))(n||e)}})();static \u0275prov=g({token:e,factory:e.\u0275fac})}return e})();var $t=(()=>{class e extends F{pcTabs=s(I(()=>$));value=K(void 0);id=r(()=>`${this.pcTabs.id()}_tabpanel_${this.value()}`);ariaLabelledby=r(()=>`${this.pcTabs.id()}_tab_${this.value()}`);active=r(()=>Z(this.pcTabs.value(),this.value()));_componentStyle=s(Tt);static \u0275fac=(()=>{let t;return function(n){return(t||(t=c(e)))(n||e)}})();static \u0275cmp=m({type:e,selectors:[["p-tabpanel"]],hostVars:7,hostBindings:function(a,n){a&2&&(d("data-pc-name","tabpanel")("id",n.id())("role","tabpanel")("aria-labelledby",n.ariaLabelledby())("data-p-active",n.active()),l(n.cx("root")))},inputs:{value:[1,"value"]},outputs:{value:"valueChange"},features:[B([Tt]),y],ngContentSelectors:V,decls:1,vars:1,template:function(a,n){a&1&&(x(),_(0,Rt,1,0)),a&2&&T(n.active()?0:-1)},dependencies:[k],encapsulation:2,changeDetection:0})}return e})(),qt={root:"p-tabpanels"},xt=(()=>{class e extends C{name="tabpanels";classes=qt;static \u0275fac=(()=>{let t;return function(n){return(t||(t=c(e)))(n||e)}})();static \u0275prov=g({token:e,factory:e.\u0275fac})}return e})();var Wt=(()=>{class e extends F{_componentStyle=s(xt);static \u0275fac=(()=>{let t;return function(n){return(t||(t=c(e)))(n||e)}})();static \u0275cmp=m({type:e,selectors:[["p-tabpanels"]],hostVars:4,hostBindings:function(a,n){a&2&&(d("data-pc-name","tabpanels")("role","presentation"),l(n.cx("root")))},features:[B([xt]),y],ngContentSelectors:V,decls:1,vars:0,template:function(a,n){a&1&&(x(),w(0))},dependencies:[k],encapsulation:2,changeDetection:0})}return e})(),$=(()=>{class e extends F{value=K(void 0);scrollable=h(!1,{transform:M});lazy=h(!1,{transform:M});selectOnFocus=h(!1,{transform:M});showNavigators=h(!0,{transform:M});tabindex=h(0,{transform:st});id=A(ut("pn_id_"));_componentStyle=s(mt);updateValue(t){this.value.update(()=>t)}static \u0275fac=(()=>{let t;return function(n){return(t||(t=c(e)))(n||e)}})();static \u0275cmp=m({type:e,selectors:[["p-tabs"]],hostVars:4,hostBindings:function(a,n){a&2&&(d("data-pc-name","tabs")("id",n.id()),l(n.cx("root")))},inputs:{value:[1,"value"],scrollable:[1,"scrollable"],lazy:[1,"lazy"],selectOnFocus:[1,"selectOnFocus"],showNavigators:[1,"showNavigators"],tabindex:[1,"tabindex"]},outputs:{value:"valueChange"},features:[B([mt]),y],ngContentSelectors:V,decls:1,vars:0,template:function(a,n){a&1&&(x(),w(0))},dependencies:[k],encapsulation:2,changeDetection:0})}return e})(),ge=(()=>{class e{static \u0275fac=function(a){return new(a||e)};static \u0275mod=it({type:e});static \u0275inj=nt({imports:[$,Wt,$t,wt,Kt]})}return e})();export{wt as a,Kt as b,$t as c,Wt as d,$ as e,ge as f};
