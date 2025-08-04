import{c as ne,d as I,f as z,h as M,ma as te,na as v,qa as oe,sa as se,xa as ie,ya as ae}from"./chunk-RQNRJHRX.js";import{$a as w,Ab as h,Ba as a,Bb as x,Bc as W,Eb as G,Ec as X,Gc as Z,Ib as d,Jb as Y,Kb as $,Ma as B,Na as A,Nc as ee,Pa as L,Ra as g,Rb as J,T as O,Ta as N,Tb as T,U as E,Ub as K,Y as F,ba as D,bb as r,ca as S,cb as l,da as Q,dc as U,hb as c,ib as u,ja as R,jb as f,kb as b,na as y,qb as C,qc as k,rb as P,tb as V,vb as s,wb as q,xa as j,xb as H,yb as _}from"./chunk-I5ELLGFI.js";var ce=`
    .p-message {
        border-radius: dt('message.border.radius');
        outline-width: dt('message.border.width');
        outline-style: solid;
    }

    .p-message-content {
        display: flex;
        align-items: center;
        padding: dt('message.content.padding');
        gap: dt('message.content.gap');
        height: 100%;
    }

    .p-message-icon {
        flex-shrink: 0;
    }

    .p-message-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-inline-start: auto;
        overflow: hidden;
        position: relative;
        width: dt('message.close.button.width');
        height: dt('message.close.button.height');
        border-radius: dt('message.close.button.border.radius');
        background: transparent;
        transition:
            background dt('message.transition.duration'),
            color dt('message.transition.duration'),
            outline-color dt('message.transition.duration'),
            box-shadow dt('message.transition.duration'),
            opacity 0.3s;
        outline-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        cursor: pointer;
        user-select: none;
    }

    .p-message-close-icon {
        font-size: dt('message.close.icon.size');
        width: dt('message.close.icon.size');
        height: dt('message.close.icon.size');
    }

    .p-message-close-button:focus-visible {
        outline-width: dt('message.close.button.focus.ring.width');
        outline-style: dt('message.close.button.focus.ring.style');
        outline-offset: dt('message.close.button.focus.ring.offset');
    }

    .p-message-info {
        background: dt('message.info.background');
        outline-color: dt('message.info.border.color');
        color: dt('message.info.color');
        box-shadow: dt('message.info.shadow');
    }

    .p-message-info .p-message-close-button:focus-visible {
        outline-color: dt('message.info.close.button.focus.ring.color');
        box-shadow: dt('message.info.close.button.focus.ring.shadow');
    }

    .p-message-info .p-message-close-button:hover {
        background: dt('message.info.close.button.hover.background');
    }

    .p-message-info.p-message-outlined {
        color: dt('message.info.outlined.color');
        outline-color: dt('message.info.outlined.border.color');
    }

    .p-message-info.p-message-simple {
        color: dt('message.info.simple.color');
    }

    .p-message-success {
        background: dt('message.success.background');
        outline-color: dt('message.success.border.color');
        color: dt('message.success.color');
        box-shadow: dt('message.success.shadow');
    }

    .p-message-success .p-message-close-button:focus-visible {
        outline-color: dt('message.success.close.button.focus.ring.color');
        box-shadow: dt('message.success.close.button.focus.ring.shadow');
    }

    .p-message-success .p-message-close-button:hover {
        background: dt('message.success.close.button.hover.background');
    }

    .p-message-success.p-message-outlined {
        color: dt('message.success.outlined.color');
        outline-color: dt('message.success.outlined.border.color');
    }

    .p-message-success.p-message-simple {
        color: dt('message.success.simple.color');
    }

    .p-message-warn {
        background: dt('message.warn.background');
        outline-color: dt('message.warn.border.color');
        color: dt('message.warn.color');
        box-shadow: dt('message.warn.shadow');
    }

    .p-message-warn .p-message-close-button:focus-visible {
        outline-color: dt('message.warn.close.button.focus.ring.color');
        box-shadow: dt('message.warn.close.button.focus.ring.shadow');
    }

    .p-message-warn .p-message-close-button:hover {
        background: dt('message.warn.close.button.hover.background');
    }

    .p-message-warn.p-message-outlined {
        color: dt('message.warn.outlined.color');
        outline-color: dt('message.warn.outlined.border.color');
    }

    .p-message-warn.p-message-simple {
        color: dt('message.warn.simple.color');
    }

    .p-message-error {
        background: dt('message.error.background');
        outline-color: dt('message.error.border.color');
        color: dt('message.error.color');
        box-shadow: dt('message.error.shadow');
    }

    .p-message-error .p-message-close-button:focus-visible {
        outline-color: dt('message.error.close.button.focus.ring.color');
        box-shadow: dt('message.error.close.button.focus.ring.shadow');
    }

    .p-message-error .p-message-close-button:hover {
        background: dt('message.error.close.button.hover.background');
    }

    .p-message-error.p-message-outlined {
        color: dt('message.error.outlined.color');
        outline-color: dt('message.error.outlined.border.color');
    }

    .p-message-error.p-message-simple {
        color: dt('message.error.simple.color');
    }

    .p-message-secondary {
        background: dt('message.secondary.background');
        outline-color: dt('message.secondary.border.color');
        color: dt('message.secondary.color');
        box-shadow: dt('message.secondary.shadow');
    }

    .p-message-secondary .p-message-close-button:focus-visible {
        outline-color: dt('message.secondary.close.button.focus.ring.color');
        box-shadow: dt('message.secondary.close.button.focus.ring.shadow');
    }

    .p-message-secondary .p-message-close-button:hover {
        background: dt('message.secondary.close.button.hover.background');
    }

    .p-message-secondary.p-message-outlined {
        color: dt('message.secondary.outlined.color');
        outline-color: dt('message.secondary.outlined.border.color');
    }

    .p-message-secondary.p-message-simple {
        color: dt('message.secondary.simple.color');
    }

    .p-message-contrast {
        background: dt('message.contrast.background');
        outline-color: dt('message.contrast.border.color');
        color: dt('message.contrast.color');
        box-shadow: dt('message.contrast.shadow');
    }

    .p-message-contrast .p-message-close-button:focus-visible {
        outline-color: dt('message.contrast.close.button.focus.ring.color');
        box-shadow: dt('message.contrast.close.button.focus.ring.shadow');
    }

    .p-message-contrast .p-message-close-button:hover {
        background: dt('message.contrast.close.button.hover.background');
    }

    .p-message-contrast.p-message-outlined {
        color: dt('message.contrast.outlined.color');
        outline-color: dt('message.contrast.outlined.border.color');
    }

    .p-message-contrast.p-message-simple {
        color: dt('message.contrast.simple.color');
    }

    .p-message-text {
        font-size: dt('message.text.font.size');
        font-weight: dt('message.text.font.weight');
    }

    .p-message-icon {
        font-size: dt('message.icon.size');
        width: dt('message.icon.size');
        height: dt('message.icon.size');
    }

    .p-message-enter-from {
        opacity: 0;
    }

    .p-message-enter-active {
        transition: opacity 0.3s;
    }

    .p-message.p-message-leave-from {
        max-height: 1000px;
    }

    .p-message.p-message-leave-to {
        max-height: 0;
        opacity: 0;
        margin: 0;
    }

    .p-message-leave-active {
        overflow: hidden;
        transition:
            max-height 0.45s cubic-bezier(0, 1, 0, 1),
            opacity 0.3s,
            margin 0.3s;
    }

    .p-message-leave-active .p-message-close-button {
        opacity: 0;
    }

    .p-message-sm .p-message-content {
        padding: dt('message.content.sm.padding');
    }

    .p-message-sm .p-message-text {
        font-size: dt('message.text.sm.font.size');
    }

    .p-message-sm .p-message-icon {
        font-size: dt('message.icon.sm.size');
        width: dt('message.icon.sm.size');
        height: dt('message.icon.sm.size');
    }

    .p-message-sm .p-message-close-icon {
        font-size: dt('message.close.icon.sm.size');
        width: dt('message.close.icon.sm.size');
        height: dt('message.close.icon.sm.size');
    }

    .p-message-lg .p-message-content {
        padding: dt('message.content.lg.padding');
    }

    .p-message-lg .p-message-text {
        font-size: dt('message.text.lg.font.size');
    }

    .p-message-lg .p-message-icon {
        font-size: dt('message.icon.lg.size');
        width: dt('message.icon.lg.size');
        height: dt('message.icon.lg.size');
    }

    .p-message-lg .p-message-close-icon {
        font-size: dt('message.close.icon.lg.size');
        width: dt('message.close.icon.lg.size');
        height: dt('message.close.icon.lg.size');
    }

    .p-message-outlined {
        background: transparent;
        outline-width: dt('message.outlined.border.width');
    }

    .p-message-simple {
        background: transparent;
        outline-color: transparent;
        box-shadow: none;
    }

    .p-message-simple .p-message-content {
        padding: dt('message.simple.content.padding');
    }

    .p-message-outlined .p-message-close-button:hover,
    .p-message-simple .p-message-close-button:hover {
        background: transparent;
    }
`;var le=["container"],me=["icon"],ge=["closeicon"],de=["*"],pe=(e,o)=>({showTransitionParams:e,hideTransitionParams:o}),ue=e=>({value:"visible()",params:e}),fe=e=>({closeCallback:e});function be(e,o){e&1&&C(0)}function _e(e,o){if(e&1&&g(0,be,1,0,"ng-container",7),e&2){let n=s(2);c("ngTemplateOutlet",n.iconTemplate||n.iconTemplate)}}function he(e,o){if(e&1&&b(0,"i"),e&2){let n=s(2);d(n.cn(n.cx("icon"),n.icon))}}function xe(e,o){if(e&1&&b(0,"span",9),e&2){let n=s(3);c("ngClass",n.cx("text"))("innerHTML",n.text,j)}}function Ce(e,o){if(e&1&&(u(0,"div"),g(1,xe,1,2,"span",8),f()),e&2){let n=s(2);a(),c("ngIf",!n.escape)}}function ve(e,o){if(e&1&&(u(0,"span",5),Y(1),f()),e&2){let n=s(3);c("ngClass",n.cx("text")),a(),$(n.text)}}function ye(e,o){if(e&1&&g(0,ve,2,2,"span",10),e&2){let n=s(2);c("ngIf",n.escape&&n.text)}}function we(e,o){e&1&&C(0)}function Te(e,o){if(e&1&&g(0,we,1,0,"ng-container",11),e&2){let n=s(2);c("ngTemplateOutlet",n.containerTemplate||n.containerTemplate)("ngTemplateOutletContext",T(2,fe,n.close.bind(n)))}}function ke(e,o){if(e&1&&(u(0,"span",5),H(1),f()),e&2){let n=s(2);c("ngClass",n.cx("text"))}}function Ie(e,o){if(e&1&&b(0,"i",5),e&2){let n=s(3);d(n.cn(n.cx("closeIcon"),n.closeIcon)),c("ngClass",n.closeIcon)}}function ze(e,o){e&1&&C(0)}function Me(e,o){if(e&1&&g(0,ze,1,0,"ng-container",7),e&2){let n=s(3);c("ngTemplateOutlet",n.closeIconTemplate||n._closeIconTemplate)}}function Oe(e,o){if(e&1&&(Q(),b(0,"svg",15)),e&2){let n=s(3);d(n.cx("closeIcon"))}}function Ee(e,o){if(e&1){let n=P();u(0,"button",12),V("click",function(i){D(n);let p=s(2);return S(p.close(i))}),r(1,Ie,1,3,"i",13),r(2,Me,1,1,"ng-container"),r(3,Oe,1,2,":svg:svg",14),f()}if(e&2){let n=s(2);d(n.cx("closeButton")),w("aria-label",n.closeAriaLabel),a(),l(n.closeIcon?1:-1),a(),l(n.closeIconTemplate||n._closeIconTemplate?2:-1),a(),l(!n.closeIconTemplate&&!n._closeIconTemplate&&!n.closeIcon?3:-1)}}function Fe(e,o){if(e&1&&(u(0,"div",2)(1,"div"),r(2,_e,1,1,"ng-container"),r(3,he,1,2,"i",3),g(4,Ce,2,1,"div",4)(5,ye,1,1,"ng-template",null,0,U),r(7,Te,1,4,"ng-container")(8,ke,2,1,"span",5),r(9,Ee,4,6,"button",6),f()()),e&2){let n=G(6),t=s();d(t.cn(t.cx("root"),t.styleClass)),c("@messageAnimation",T(16,ue,K(13,pe,t.showTransitionOptions,t.hideTransitionOptions))),w("aria-live","polite")("role","alert"),a(),d(t.cx("content")),a(),l(t.iconTemplate||t._iconTemplate?2:-1),a(),l(t.icon?3:-1),a(),c("ngIf",!t.escape)("ngIfElse",n),a(3),l(t.containerTemplate||t._containerTemplate?7:8),a(2),l(t.closable?9:-1)}}var De={root:({instance:e})=>["p-message p-component p-message-"+e.severity,"p-message-"+e.variant,{"p-message-sm":e.size==="small","p-message-lg":e.size==="large"}],content:"p-message-content",icon:"p-message-icon",text:"p-message-text",closeButton:"p-message-close-button",closeIcon:"p-message-close-icon"},re=(()=>{class e extends oe{name="message";theme=ce;classes=De;static \u0275fac=(()=>{let n;return function(i){return(n||(n=y(e)))(i||e)}})();static \u0275prov=O({token:e,factory:e.\u0275fac})}return e})();var Se=(()=>{class e extends se{severity="info";text;escape=!0;style;styleClass;closable=!1;icon;closeIcon;life;showTransitionOptions="300ms ease-out";hideTransitionOptions="200ms cubic-bezier(0.86, 0, 0.07, 1)";size;variant;onClose=new N;get closeAriaLabel(){return this.config.translation.aria?this.config.translation.aria.close:void 0}visible=R(!0);_componentStyle=F(re);containerTemplate;iconTemplate;closeIconTemplate;templates;_containerTemplate;_iconTemplate;_closeIconTemplate;ngOnInit(){super.ngOnInit(),this.life&&setTimeout(()=>{this.visible.set(!1)},this.life)}ngAfterContentInit(){this.templates?.forEach(n=>{switch(n.getType()){case"container":this._containerTemplate=n.template;break;case"icon":this._iconTemplate=n.template;break;case"closeicon":this._closeIconTemplate=n.template;break}})}close(n){this.visible.set(!1),this.onClose.emit({originalEvent:n})}static \u0275fac=(()=>{let n;return function(i){return(n||(n=y(e)))(i||e)}})();static \u0275cmp=B({type:e,selectors:[["p-message"]],contentQueries:function(t,i,p){if(t&1&&(_(p,le,4),_(p,me,4),_(p,ge,4),_(p,te,4)),t&2){let m;h(m=x())&&(i.containerTemplate=m.first),h(m=x())&&(i.iconTemplate=m.first),h(m=x())&&(i.closeIconTemplate=m.first),h(m=x())&&(i.templates=m)}},inputs:{severity:"severity",text:"text",escape:[2,"escape","escape",k],style:"style",styleClass:"styleClass",closable:[2,"closable","closable",k],icon:"icon",closeIcon:"closeIcon",life:"life",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",size:"size",variant:"variant"},outputs:{onClose:"onClose"},features:[J([re]),L],ngContentSelectors:de,decls:1,vars:1,consts:[["escapeOut",""],[1,"p-message","p-component",3,"class"],[1,"p-message","p-component"],[3,"class"],[4,"ngIf","ngIfElse"],[3,"ngClass"],["pRipple","","type","button",3,"class"],[4,"ngTemplateOutlet"],[3,"ngClass","innerHTML",4,"ngIf"],[3,"ngClass","innerHTML"],[3,"ngClass",4,"ngIf"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],["pRipple","","type","button",3,"click"],[3,"class","ngClass"],["data-p-icon","times",3,"class"],["data-p-icon","times"]],template:function(t,i){t&1&&(q(),r(0,Fe,10,18,"div",1)),t&2&&l(i.visible()?0:-1)},dependencies:[ee,W,X,Z,ie,ae,v],encapsulation:2,data:{animation:[ne("messageAnimation",[M(":enter",[z({opacity:0,transform:"translateY(-25%)"}),I("{{showTransitionParams}}")]),M(":leave",[I("{{hideTransitionParams}}",z({height:0,marginTop:0,marginBottom:0,marginLeft:0,marginRight:0,opacity:0}))])])]},changeDetection:0})}return e})(),nn=(()=>{class e{static \u0275fac=function(t){return new(t||e)};static \u0275mod=A({type:e});static \u0275inj=E({imports:[Se,v,v]})}return e})();export{Se as a,nn as b};
