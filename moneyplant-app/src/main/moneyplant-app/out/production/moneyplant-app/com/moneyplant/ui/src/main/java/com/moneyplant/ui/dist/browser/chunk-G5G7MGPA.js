import{e as mt,f as gt}from"./chunk-LUZOZIDA.js";import{A as V,Aa as Ct,B as ht,Ba as yt,C as f,I as W,L as S,aa as _t,ia as N,ja as $,ma as ft,oa as j,ta as vt,ua as Tt,w as pt,z as ut}from"./chunk-XBYO5J67.js";import{$a as c,Ab as s,Bb as R,Cb as D,Db as h,Eb as y,Fb as d,Fc as dt,Gb as b,Ic as z,Jc as bt,Ka as p,Kc as q,Lb as nt,Mb as at,Nb as L,Ob as ot,Qb as lt,R as U,Rc as K,S as G,T as J,Va as O,Vc as A,Wa as X,Wb as M,X as F,Yb as st,Za as Q,Zb as rt,aa as T,ba as C,bb as E,jb as u,kb as g,lb as v,ma as B,nb as Y,ob as Z,pb as tt,qb as r,rb as _,sb as m,tb as w,ub as et,uc as x,vb as it,vc as ct,wb as H,xb as I,zb as k}from"./chunk-E5FNFP2Z.js";var xt=["content"],St=["header"],$t=["lefticon"],Ft=["righticon"],Bt=["closeicon"],wt=["*"];function Et(e,o){e&1&&H(0)}function At(e,o){if(e&1&&(et(0),c(1,Et,1,0,"ng-container",3),it()),e&2){let t=s(2);p(),r("ngTemplateOutlet",t.contentTemplate||t._contentTemplate)}}function Pt(e,o){if(e&1&&(_(0,"div",1),D(1),c(2,At,2,1,"ng-container",2),m()),e&2){let t=s();r("hidden",!t.selected),u("id",t.tabView.getTabContentId(t.id))("aria-hidden",!t.selected)("aria-labelledby",t.tabView.getTabHeaderActionId(t.id))("data-pc-name","tabpanel"),p(2),r("ngIf",(t.contentTemplate||t._contentTemplate)&&(t.cache?t.loaded:t.selected))}}var Ot=["previousicon"],Qt=["nexticon"],Ht=["navbar"],Rt=["prevBtn"],Dt=["nextBtn"],Lt=["inkbar"],Mt=["elementToObserve"],zt=e=>({"p-tablist-viewport":e}),qt=(e,o)=>({"p-tab":!0,"p-tab-active":e,"p-disabled":o});function Kt(e,o){e&1&&w(0,"ChevronLeftIcon"),e&2&&u("aria-hidden",!0)}function Wt(e,o){}function Nt(e,o){e&1&&c(0,Wt,0,0,"ng-template")}function jt(e,o){if(e&1){let t=I();_(0,"button",12,3),k("click",function(){T(t);let n=s();return C(n.navBackward())}),c(2,Kt,1,1,"ChevronLeftIcon",13)(3,Nt,1,0,null,14),m()}if(e&2){let t=s();u("tabindex",t.tabindex)("aria-label",t.prevButtonAriaLabel),p(2),r("ngIf",!t.previousIconTemplate&&!t._previousIconTemplate),p(),r("ngTemplateOutlet",t.previousIconTemplate&&t._previousIconTemplate)}}function Ut(e,o){e&1&&H(0)}function Gt(e,o){if(e&1&&c(0,Ut,1,0,"ng-container",14),e&2){let t=s(2).$implicit;r("ngTemplateOutlet",t.headerTemplate||t._headerTemplate)}}function Jt(e,o){}function Xt(e,o){e&1&&c(0,Jt,0,0,"ng-template")}function Yt(e,o){if(e&1&&c(0,Xt,1,0,null,14),e&2){let t=s(3).$implicit;r("ngTemplateOutlet",t.leftIconTemplate||t._leftIconTemplate)}}function Zt(e,o){if(e&1&&w(0,"span",17),e&2){let t=s(3).$implicit;r("ngClass",t.leftIcon)}}function te(e,o){}function ee(e,o){e&1&&c(0,te,0,0,"ng-template")}function ie(e,o){if(e&1&&c(0,ee,1,0,null,14),e&2){let t=s(3).$implicit;r("ngTemplateOutlet",t.rightIconTemplate||t._rightIconTemplate)}}function ne(e,o){if(e&1&&w(0,"span",18),e&2){let t=s(3).$implicit;r("ngClass",t.rightIcon)}}function ae(e,o){}function oe(e,o){e&1&&c(0,ae,0,0,"ng-template")}function le(e,o){if(e&1&&c(0,oe,1,0,null,14),e&2){let t=s(4).$implicit;r("ngTemplateOutlet",t.closeIconTemplate||t._closeIconTemplate)}}function se(e,o){if(e&1){let t=I();_(0,"TimesIcon",19),k("click",function(n){T(t);let a=s(4).$implicit,l=s();return C(l.close(n,a))}),m()}}function re(e,o){if(e&1&&g(0,le,1,1)(1,se,1,0,"TimesIcon"),e&2){let t=s(3).$implicit;v(t.closeIconTemplate||t._closeIconTemplate?0:1)}}function ce(e,o){if(e&1&&(g(0,Yt,1,1)(1,Zt,1,1,"span",17),ot(2),g(3,ie,1,1)(4,ne,1,1,"span",18),g(5,re,2,1)),e&2){let t=s(2).$implicit;v(t.leftIconTemplate||t._leftIconTemplate?0:t.leftIcon&&!t.leftIconTemplate&&!t._leftIconTemplate?1:-1),p(2),lt(" ",t.header," "),p(),v(t.rightIconTemplate||t._rightIconTemplate?3:t.rightIcon&&!t.rightIconTemplate&&!t._rightIconTemplate?4:-1),p(2),v(t.closable?5:-1)}}function de(e,o){if(e&1){let t=I();_(0,"button",15),k("click",function(n){T(t);let a=s().$implicit,l=s();return C(l.open(n,a))})("keydown",function(n){T(t);let a=s().$implicit,l=s();return C(l.onTabKeyDown(n,a))}),g(1,Gt,1,1,"ng-container")(2,ce,6,4),m(),w(3,"span",16,4)}if(e&2){let t=s(),i=t.$implicit,n=t.$index,a=s();L(i.headerStyleClass),r("ngClass",rt(22,qt,i.selected,i.disabled))("ngStyle",i.headerStyle)("pTooltip",i.tooltip)("tooltipPosition",i.tooltipPosition)("positionStyle",i.tooltipPositionStyle)("tooltipStyleClass",i.tooltipStyleClass)("disabled",i.disabled),u("role","tab")("id",a.getTabHeaderActionId(i.id))("aria-controls",a.getTabContentId(i.id))("aria-selected",i.selected)("tabindex",i.disabled||!i.selected?"-1":a.tabindex)("aria-disabled",i.disabled)("data-pc-index",n)("data-p-disabled",i.disabled)("data-pc-section","headeraction")("data-p-active",i.selected),p(),v(i.headerTemplate||i._headerTemplate?1:2),p(2),u("aria-hidden",!0)("data-pc-section","inkbar")}}function be(e,o){if(e&1&&g(0,de,5,25),e&2){let t=o.$implicit;v(t.closed?-1:0)}}function pe(e,o){}function ue(e,o){e&1&&c(0,pe,0,0,"ng-template")}function he(e,o){if(e&1&&c(0,ue,1,0,null,14),e&2){let t=s(2);r("ngTemplateOutlet",t.nextIconTemplate||t._nextIconTemplate)}}function _e(e,o){e&1&&w(0,"ChevronRightIcon"),e&2&&u("aria-hidden",!0)}function fe(e,o){if(e&1){let t=I();_(0,"button",20,5),k("click",function(){T(t);let n=s();return C(n.navForward())}),g(2,he,1,1)(3,_e,1,1,"ChevronRightIcon"),m()}if(e&2){let t=s();u("tabindex",t.tabindex)("aria-label",t.nextButtonAriaLabel),p(2),v(t.nextIconTemplate||t._nextIconTemplate?2:3)}}var me=({dt:e})=>`
.p-tabs {
    display: flex;
    flex-direction: column;
}

.p-tablist {
    display: flex;
    position: relative;
}

.p-tabs-scrollable > .p-tablist {
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
    background: ${e("tabs.tablist.background")};
    border-style: solid;
    border-color: ${e("tabs.tablist.border.color")};
    border-width: ${e("tabs.tablist.border.width")};
}

.p-tablist-content {
    flex-grow: 1;
}

.p-tablist-nav-button {
    all: unset;
    position: absolute !important;
    flex-shrink: 0;
    top: 0;
    z-index: 2;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${e("tabs.nav.button.background")};
    color: ${e("tabs.nav.button.color")};
    width: ${e("tabs.nav.button.width")};
    transition: color ${e("tabs.transition.duration")}, outline-color ${e("tabs.transition.duration")}, box-shadow ${e("tabs.transition.duration")};
    box-shadow: ${e("tabs.nav.button.shadow")};
    outline-color: transparent;
    cursor: pointer;
}

.p-tablist-nav-button:focus-visible {
    z-index: 1;
    box-shadow: ${e("tabs.nav.button.focus.ring.shadow")};
    outline: ${e("tabs.nav.button.focus.ring.width")} ${e("tabs.nav.button.focus.ring.style")} ${e("tabs.nav.button.focus.ring.color")};
    outline-offset: ${e("tabs.nav.button.focus.ring.offset")};
}

.p-tablist-nav-button:hover {
    color: ${e("tabs.nav.button.hover.color")};
}

.p-tablist-prev-button {
    left: 0;
}

.p-tablist-next-button {
    right: 0;
}

.p-tab {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    cursor: pointer;
    user-select: none;
    position: relative;
    border-style: solid;
    white-space: nowrap;
    gap: ${e("tabs.tab.gap")};
    background: ${e("tabs.tab.background")};
    border-width: ${e("tabs.tab.border.width")};
    border-color: ${e("tabs.tab.border.color")};
    color: ${e("tabs.tab.color")};
    padding: ${e("tabs.tab.padding")};
    font-weight: ${e("tabs.tab.font.weight")};
    transition: background ${e("tabs.transition.duration")}, border-color ${e("tabs.transition.duration")}, color ${e("tabs.transition.duration")}, outline-color ${e("tabs.transition.duration")}, box-shadow ${e("tabs.transition.duration")};
    margin: ${e("tabs.tab.margin")};
    outline-color: transparent;
}

.p-tab:not(.p-disabled):focus-visible {
    z-index: 1;
    box-shadow: ${e("tabs.tab.focus.ring.shadow")};
    outline: ${e("tabs.tab.focus.ring.width")} ${e("tabs.tab.focus.ring.style")} ${e("tabs.tab.focus.ring.color")};
    outline-offset: ${e("tabs.tab.focus.ring.offset")};
}

.p-tab:not(.p-tab-active):not(.p-disabled):hover {
    background: ${e("tabs.tab.hover.background")};
    border-color: ${e("tabs.tab.hover.border.color")};
    color: ${e("tabs.tab.hover.color")};
}

.p-tab-active {
    background: ${e("tabs.tab.active.background")};
    border-color: ${e("tabs.tab.active.border.color")};
    color: ${e("tabs.tab.active.color")};
}

.p-tabpanels {
    background: ${e("tabs.tabpanel.background")};
    color: ${e("tabs.tabpanel.color")};
    padding: ${e("tabs.tabpanel.padding")};
    outline: 0 none;
}

.p-tabpanel:focus-visible {
    box-shadow: ${e("tabs.tabpanel.focus.ring.shadow")};
    outline: ${e("tabs.tabpanel.focus.ring.width")} ${e("tabs.tabpanel.focus.ring.style")} ${e("tabs.tabpanel.focus.ring.color")};
    outline-offset: ${e("tabs.tabpanel.focus.ring.offset")};
}

.p-tablist-active-bar {
    z-index: 1;
    display: block;
    position: absolute;
    bottom: ${e("tabs.active.bar.bottom")};
    height: ${e("tabs.active.bar.height")};
    background: ${e("tabs.active.bar.background")};
    transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
}
`,ge={root:({props:e})=>["p-tabs p-component",{"p-tabs-scrollable":e.scrollable}]},P=(()=>{class e extends ft{name="tabs";theme=me;classes=ge;static \u0275fac=(()=>{let t;return function(n){return(t||(t=B(e)))(n||e)}})();static \u0275prov=G({token:e,factory:e.\u0275fac})}return e})();var It=(()=>{class e extends j{closable=!1;get headerStyle(){return this._headerStyle}set headerStyle(t){this._headerStyle=t,this.tabView.cd.markForCheck()}get headerStyleClass(){return this._headerStyleClass}set headerStyleClass(t){this._headerStyleClass=t,this.tabView.cd.markForCheck()}cache=!0;tooltip;tooltipPosition="top";tooltipPositionStyle="absolute";tooltipStyleClass;get selected(){return!!this._selected}set selected(t){this._selected=t,this.loaded||this.cd.detectChanges(),t&&(this.loaded=!0)}get disabled(){return!!this._disabled}set disabled(t){this._disabled=t,this.tabView.cd.markForCheck()}get header(){return this._header}set header(t){this._header=t,Promise.resolve().then(()=>{this.tabView.updateInkBar(),this.tabView.cd.markForCheck()})}get leftIcon(){return this._leftIcon}set leftIcon(t){this._leftIcon=t,this.tabView.cd.markForCheck()}get rightIcon(){return this._rightIcon}set rightIcon(t){this._rightIcon=t,this.tabView.cd.markForCheck()}closed=!1;_headerStyle;_headerStyleClass;_selected;_disabled;_header;_leftIcon;_rightIcon=void 0;loaded=!1;id=_t("pn_id_");contentTemplate;headerTemplate;leftIconTemplate;rightIconTemplate;closeIconTemplate;templates;tabView=F(U(()=>kt));_componentStyle=F(P);_headerTemplate;_contentTemplate;_rightIconTemplate;_leftIconTemplate;_closeIconTemplate;ngAfterContentInit(){this.templates.forEach(t=>{switch(t.getType()){case"header":this._headerTemplate=t.template;break;case"content":this._contentTemplate=t.template;break;case"righticon":this._rightIconTemplate=t.template;break;case"lefticon":this._leftIconTemplate=t.template;break;case"closeicon":this._closeIconTemplate=t.template;break;default:this._contentTemplate=t.template;break}})}static \u0275fac=(()=>{let t;return function(n){return(t||(t=B(e)))(n||e)}})();static \u0275cmp=O({type:e,selectors:[["p-tabPanel"],["p-tabpanel"]],contentQueries:function(i,n,a){if(i&1&&(h(a,xt,5),h(a,St,5),h(a,$t,5),h(a,Ft,5),h(a,Bt,5),h(a,N,4)),i&2){let l;d(l=b())&&(n.contentTemplate=l.first),d(l=b())&&(n.headerTemplate=l.first),d(l=b())&&(n.leftIconTemplate=l.first),d(l=b())&&(n.rightIconTemplate=l.first),d(l=b())&&(n.closeIconTemplate=l.first),d(l=b())&&(n.templates=l)}},inputs:{closable:[2,"closable","closable",x],headerStyle:"headerStyle",headerStyleClass:"headerStyleClass",cache:[2,"cache","cache",x],tooltip:"tooltip",tooltipPosition:"tooltipPosition",tooltipPositionStyle:"tooltipPositionStyle",tooltipStyleClass:"tooltipStyleClass",selected:"selected",disabled:"disabled",header:"header",leftIcon:"leftIcon",rightIcon:"rightIcon"},features:[M([P]),Q],ngContentSelectors:wt,decls:1,vars:1,consts:[["class","p-tabview-panel","role","tabpanel",3,"hidden",4,"ngIf"],["role","tabpanel",1,"p-tabview-panel",3,"hidden"],[4,"ngIf"],[4,"ngTemplateOutlet"]],template:function(i,n){i&1&&(R(),c(0,Pt,3,6,"div",0)),i&2&&r("ngIf",!n.closed)},dependencies:[K,z,q,$],encapsulation:2})}return e})(),kt=(()=>{class e extends j{get hostClass(){return this.styleClass}get hostStyle(){return this.style}style;styleClass;controlClose;scrollable;get activeIndex(){return this._activeIndex}set activeIndex(t){if(this._activeIndex=t,this.preventActiveIndexPropagation){this.preventActiveIndexPropagation=!1;return}this.tabs&&this.tabs.length&&this._activeIndex!=null&&this.tabs.length>this._activeIndex&&(this.findSelectedTab().selected=!1,this.tabs[this._activeIndex].selected=!0,this.tabChanged=!0,this.updateScrollBar(t))}selectOnFocus=!1;nextButtonAriaLabel;prevButtonAriaLabel;autoHideButtons=!0;tabindex=0;onChange=new E;onClose=new E;activeIndexChange=new E;content;navbar;prevBtn;nextBtn;inkbar;tabPanels;initialized;tabs;_activeIndex;preventActiveIndexPropagation;tabChanged;backwardIsDisabled=!0;forwardIsDisabled=!1;tabChangesSubscription;resizeObserver;container;list;buttonVisible;elementToObserve;previousIconTemplate;nextIconTemplate;_previousIconTemplate;_nextIconTemplate;_componentStyle=F(P);templates;ngOnInit(){super.ngOnInit(),console.log("TabView component is deprecated as of v18. Use Tabs component instead.")}ngAfterContentInit(){this.initTabs(),this.tabChangesSubscription=this.tabPanels.changes.subscribe(t=>{this.initTabs(),this.refreshButtonState()}),this.templates.forEach(t=>{switch(t.getType()){case"previousicon":this._previousIconTemplate=t.template;break;case"nexticon":this._nextIconTemplate=t.template;break}})}ngAfterViewInit(){super.ngAfterViewInit(),A(this.platformId)&&this.autoHideButtons&&this.bindResizeObserver()}bindResizeObserver(){this.container=V(this.el.nativeElement,'[data-pc-section="navcontent"]'),this.list=V(this.el.nativeElement,'[data-pc-section="nav"]'),this.resizeObserver=new ResizeObserver(()=>{this.list.offsetWidth>=this.container.offsetWidth?this.buttonVisible=!0:this.buttonVisible=!1,this.updateButtonState(),this.cd.detectChanges()}),this.resizeObserver.observe(this.container)}unbindResizeObserver(){this.resizeObserver.unobserve(this.elementToObserve.nativeElement),this.resizeObserver=null}ngAfterViewChecked(){A(this.platformId)&&this.tabChanged&&(this.updateInkBar(),this.tabChanged=!1)}ngOnDestroy(){this.tabChangesSubscription&&this.tabChangesSubscription.unsubscribe(),this.resizeObserver&&this.unbindResizeObserver(),super.ngOnDestroy()}getTabHeaderActionId(t){return`${t}_header_action`}getTabContentId(t){return`${t}_content`}initTabs(){this.tabs=this.tabPanels.toArray(),!this.findSelectedTab()&&this.tabs.length&&(this.activeIndex!=null&&this.tabs.length>this.activeIndex?this.tabs[this.activeIndex].selected=!0:this.tabs[0].selected=!0,this.tabChanged=!0),this.cd.markForCheck()}onTabKeyDown(t,i){switch(t.code){case"ArrowLeft":this.onTabArrowLeftKey(t);break;case"ArrowRight":this.onTabArrowRightKey(t);break;case"Home":this.onTabHomeKey(t);break;case"End":this.onTabEndKey(t);break;case"PageDown":this.onTabEndKey(t);break;case"PageUp":this.onTabHomeKey(t);break;case"Enter":case"Space":this.open(t,i);break;default:break}}onTabArrowLeftKey(t){let i=this.findPrevHeaderAction(t.currentTarget),n=f(i,"data-pc-index");i?this.changeFocusedTab(t,i,n):this.onTabEndKey(t),t.preventDefault()}onTabArrowRightKey(t){let i=this.findNextHeaderAction(t.currentTarget),n=f(i,"data-pc-index");i?this.changeFocusedTab(t,i,n):this.onTabHomeKey(t),t.preventDefault()}onTabHomeKey(t){let i=this.findFirstHeaderAction(),n=f(i,"data-pc-index");this.changeFocusedTab(t,i,n),t.preventDefault()}onTabEndKey(t){let i=this.findLastHeaderAction(),n=f(i,"data-pc-index");this.changeFocusedTab(t,i,n),t.preventDefault()}changeFocusedTab(t,i,n){if(i&&(ht(i),i.scrollIntoView({block:"nearest"}),this.selectOnFocus)){let a=this.tabs[n];this.open(t,a)}}findNextHeaderAction(t,i=!1){let n=i?t:t.nextElementSibling;return n?f(n,"data-p-disabled")||f(n,"data-pc-section")==="inkbar"?this.findNextHeaderAction(n):n:null}findPrevHeaderAction(t,i=!1){let n=i?t:t.previousElementSibling;return n?f(n,"data-p-disabled")||f(n,"data-pc-section")==="inkbar"?this.findPrevHeaderAction(n):n:null}findFirstHeaderAction(){let t=this.navbar.nativeElement.firstElementChild;return this.findNextHeaderAction(t,!0)}findLastHeaderAction(){let t=this.navbar.nativeElement.lastElementChild,i=f(t,"data-pc-section")==="inkbar"?t.previousElementSibling:t;return this.findPrevHeaderAction(i,!0)}open(t,i){if(i.disabled){t&&t.preventDefault();return}if(!i.selected){let n=this.findSelectedTab();n&&(n.selected=!1),this.tabChanged=!0,i.selected=!0;let a=this.findTabIndex(i);this.preventActiveIndexPropagation=!0,this.activeIndexChange.emit(a),this.onChange.emit({originalEvent:t,index:a}),this.updateScrollBar(a)}t&&t.preventDefault()}close(t,i){this.controlClose?this.onClose.emit({originalEvent:t,index:this.findTabIndex(i),close:()=>{this.closeTab(i)}}):(this.closeTab(i),this.onClose.emit({originalEvent:t,index:this.findTabIndex(i)})),t.stopPropagation()}closeTab(t){if(!t.disabled){if(t.selected){this.tabChanged=!0,t.selected=!1;for(let i=0;i<this.tabs.length;i++){let n=this.tabs[i];if(!n.closed&&!t.disabled){n.selected=!0;break}}}t.closed=!0}}findSelectedTab(){for(let t=0;t<this.tabs.length;t++)if(this.tabs[t].selected)return this.tabs[t];return null}findTabIndex(t){let i=-1;for(let n=0;n<this.tabs.length;n++)if(this.tabs[n]==t){i=n;break}return i}getBlockableElement(){return this.el.nativeElement.children[0]}updateInkBar(){if(A(this.platformId)&&this.navbar){let t=V(this.navbar.nativeElement,'[data-pc-section="headeraction"][data-p-active="true"]');if(!t)return;this.inkbar.nativeElement.style.width=pt(t)+"px",this.inkbar.nativeElement.style.left=W(t).left-W(this.navbar.nativeElement).left+"px"}}updateScrollBar(t){let i=ut(this.navbar.nativeElement,'[data-pc-section="headeraction"]')[t];i&&i.scrollIntoView({block:"nearest"})}updateButtonState(){let t=this.content.nativeElement,{scrollLeft:i,scrollWidth:n}=t,a=S(t);this.backwardIsDisabled=i===0,this.forwardIsDisabled=Math.round(i)===n-a}refreshButtonState(){this.container=V(this.el.nativeElement,'[data-pc-section="navcontent"]'),this.list=V(this.el.nativeElement,'[data-pc-section="nav"]'),this.list.offsetWidth>=this.container.offsetWidth&&(this.list.offsetWidth>=this.container.offsetWidth?this.buttonVisible=!0:this.buttonVisible=!1,this.updateButtonState(),this.cd.markForCheck())}onScroll(t){this.scrollable&&this.updateButtonState(),t.preventDefault()}getVisibleButtonWidths(){return[this.prevBtn?.nativeElement,this.nextBtn?.nativeElement].reduce((t,i)=>i?t+S(i):t,0)}navBackward(){let t=this.content.nativeElement,i=S(t)-this.getVisibleButtonWidths(),n=t.scrollLeft-i;t.scrollLeft=n<=0?0:n}navForward(){let t=this.content.nativeElement,i=S(t)-this.getVisibleButtonWidths(),n=t.scrollLeft+i,a=t.scrollWidth-i;t.scrollLeft=n>=a?a:n}static \u0275fac=(()=>{let t;return function(n){return(t||(t=B(e)))(n||e)}})();static \u0275cmp=O({type:e,selectors:[["p-tabView"],["p-tabview"]],contentQueries:function(i,n,a){if(i&1&&(h(a,Ot,5),h(a,Qt,5),h(a,It,4),h(a,N,4)),i&2){let l;d(l=b())&&(n.previousIconTemplate=l.first),d(l=b())&&(n.nextIconTemplate=l.first),d(l=b())&&(n.tabPanels=l),d(l=b())&&(n.templates=l)}},viewQuery:function(i,n){if(i&1&&(y(xt,5),y(Ht,5),y(Rt,5),y(Dt,5),y(Lt,5),y(Mt,5)),i&2){let a;d(a=b())&&(n.content=a.first),d(a=b())&&(n.navbar=a.first),d(a=b())&&(n.prevBtn=a.first),d(a=b())&&(n.nextBtn=a.first),d(a=b())&&(n.inkbar=a.first),d(a=b())&&(n.elementToObserve=a.first)}},hostVars:11,hostBindings:function(i,n){i&2&&(u("data-pc-name","tabview"),at(n.hostStyle),L(n.hostClass),nt("p-tabs",!0)("p-tabs-scrollable",n.scrollable)("p-component",!0))},inputs:{style:"style",styleClass:"styleClass",controlClose:[2,"controlClose","controlClose",x],scrollable:[2,"scrollable","scrollable",x],activeIndex:"activeIndex",selectOnFocus:[2,"selectOnFocus","selectOnFocus",x],nextButtonAriaLabel:"nextButtonAriaLabel",prevButtonAriaLabel:"prevButtonAriaLabel",autoHideButtons:[2,"autoHideButtons","autoHideButtons",x],tabindex:[2,"tabindex","tabindex",ct]},outputs:{onChange:"onChange",onClose:"onClose",activeIndexChange:"activeIndexChange"},features:[M([P]),Q],ngContentSelectors:wt,decls:12,vars:7,consts:[["elementToObserve",""],["content",""],["navbar",""],["prevBtn",""],["inkbar",""],["nextBtn",""],[1,"p-tablist"],["class","p-tablist-prev-button p-tablist-nav-button","type","button","pRipple","",3,"click",4,"ngIf"],[1,"p-tablist-content",3,"scroll","ngClass"],["role","tablist",1,"p-tablist-tab-list"],["class","p-tablist-next-button p-tablist-nav-button","type","button","pRipple","",3,"click",4,"ngIf"],[1,"p-tabpanels"],["type","button","pRipple","",1,"p-tablist-prev-button","p-tablist-nav-button",3,"click"],[4,"ngIf"],[4,"ngTemplateOutlet"],["pRipple","",3,"click","keydown","ngClass","ngStyle","pTooltip","tooltipPosition","positionStyle","tooltipStyleClass","disabled"],["role","presentation",1,"p-tablist-active-bar"],[1,"p-tabview-left-icon",3,"ngClass"],[1,"p-tabview-right-icon",3,"ngClass"],[3,"click"],["type","button","pRipple","",1,"p-tablist-next-button","p-tablist-nav-button",3,"click"]],template:function(i,n){if(i&1){let a=I();R(),_(0,"div",6,0),c(2,jt,4,4,"button",7),_(3,"div",8,1),k("scroll",function(Vt){return T(a),C(n.onScroll(Vt))}),_(5,"div",9,2),Z(7,be,1,1,null,null,Y),m()(),c(9,fe,4,3,"button",10),m(),_(10,"div",11),D(11),m()}i&2&&(p(2),r("ngIf",n.scrollable&&!n.backwardIsDisabled&&n.autoHideButtons),p(),r("ngClass",st(5,zt,n.scrollable)),u("data-pc-section","navcontent"),p(2),u("data-pc-section","nav"),p(2),tt(n.tabs),p(2),r("ngIf",n.scrollable&&!n.forwardIsDisabled&&n.buttonVisible))},dependencies:[K,dt,z,q,bt,$,yt,Ct,Tt,vt,mt,gt],encapsulation:2,changeDetection:0})}return e})(),ze=(()=>{class e{static \u0275fac=function(i){return new(i||e)};static \u0275mod=X({type:e});static \u0275inj=J({imports:[kt,It,$,$]})}return e})();export{It as a,kt as b,ze as c};
