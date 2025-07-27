import{f as ge,g as ue}from"./chunk-5GSLK3QJ.js";import{i as ie,j as oe,k as re,n as ae,q as le,s as pe,v as ce,w as me}from"./chunk-W443MQAL.js";import{a as _e,b as xe}from"./chunk-KDR7S7PE.js";import{a as de,b as se}from"./chunk-D4ZEVIJO.js";import{Fa as ee,Ha as te,Ia as ne,ha as X,la as Z}from"./chunk-LW7FD3SB.js";import{h as K,j as Q,o as U}from"./chunk-23NDRVOG.js";import{Aa as d,Cb as j,Db as r,Eb as _,Ec as Y,Fa as E,Fb as C,Fc as q,Hc as J,Ib as M,Jb as I,Kb as k,La as F,Lb as L,Ma as B,Mb as V,Na as R,Oa as N,Ob as z,Qa as h,S as P,Sa as O,T as D,Vb as x,Wb as f,X as b,aa as c,ba as m,bc as W,fb as g,fc as y,gb as n,hb as i,ib as A,jb as H,kb as T,kc as S,ma as w,mb as v,ob as u,pb as p,vc as $,yc as G}from"./chunk-2IYA7GNV.js";import"./chunk-JKOY2XUY.js";var fe=`
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`;var Ee=`
    ${fe}

    /* For PrimeNG */
    .p-textarea.ng-invalid.ng-dirty {
        border-color: dt('textarea.invalid.border.color');
    }
    .p-textarea.ng-invalid.ng-dirty::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }
`,He={root:({instance:e})=>["p-textarea p-component",{"p-filled":e.$filled(),"p-textarea-resizable ":e.autoResize,"p-variant-filled":e.$variant()==="filled","p-textarea-fluid":e.hasFluid,"p-inputfield-sm p-textarea-sm":e.pSize==="small","p-textarea-lg p-inputfield-lg":e.pSize==="large","p-invalid":e.invalid()}]},he=(()=>{class e extends Z{name="textarea";theme=Ee;classes=He;static \u0275fac=(()=>{let t;return function(o){return(t||(t=w(e)))(o||e)}})();static \u0275prov=P({token:e,factory:e.\u0275fac})}return e})();var ve=(()=>{class e extends pe{autoResize;pSize;variant=y();fluid=y(void 0,{transform:S});invalid=y(void 0,{transform:S});$variant=W(()=>this.variant()||this.config.inputStyle()||this.config.inputVariant());onResize=new O;ngModelSubscription;ngControlSubscription;_componentStyle=b(he);ngControl=b(oe,{optional:!0,self:!0});pcFluid=b(ee,{optional:!0,host:!0,skipSelf:!0});get hasFluid(){return this.fluid()??!!this.pcFluid}ngOnInit(){super.ngOnInit(),this.ngControl&&(this.ngControlSubscription=this.ngControl.valueChanges.subscribe(()=>{this.updateState()}))}ngAfterViewInit(){super.ngAfterViewInit(),this.autoResize&&this.resize(),this.cd.detectChanges()}ngAfterViewChecked(){this.autoResize&&this.resize()}onInput(t){this.writeModelValue(t.target.value),this.updateState()}resize(t){this.el.nativeElement.style.height="auto",this.el.nativeElement.style.height=this.el.nativeElement.scrollHeight+"px",parseFloat(this.el.nativeElement.style.height)>=parseFloat(this.el.nativeElement.style.maxHeight)?(this.el.nativeElement.style.overflowY="scroll",this.el.nativeElement.style.height=this.el.nativeElement.style.maxHeight):this.el.nativeElement.style.overflow="hidden",this.onResize.emit(t||{})}updateState(){this.autoResize&&this.resize()}ngOnDestroy(){this.ngModelSubscription&&this.ngModelSubscription.unsubscribe(),this.ngControlSubscription&&this.ngControlSubscription.unsubscribe(),super.ngOnDestroy()}static \u0275fac=(()=>{let t;return function(o){return(t||(t=w(e)))(o||e)}})();static \u0275dir=R({type:e,selectors:[["","pTextarea",""],["","pInputTextarea",""]],hostVars:2,hostBindings:function(a,o){a&1&&u("input",function(Se){return o.onInput(Se)}),a&2&&j(o.cx("root"))},inputs:{autoResize:[2,"autoResize","autoResize",S],pSize:"pSize",variant:[1,"variant"],fluid:[1,"fluid"],invalid:[1,"invalid"]},outputs:{onResize:"onResize"},features:[L([he]),N]})}return e})(),be=(()=>{class e{static \u0275fac=function(a){return new(a||e)};static \u0275mod=B({type:e});static \u0275inj=D({})}return e})();var Ce=()=>[10,25,50],ye=(e,l)=>({"text-green-500":e,"text-red-500":l});function Me(e,l){if(e&1){let t=v();n(0,"div",7)(1,"h2",8),r(2,"Holdings"),i(),n(3,"p-button",9),u("onClick",function(){c(t);let o=p(2);return m(o.onNewHolding())}),i()()}}function Ie(e,l){e&1&&(n(0,"tr")(1,"th"),r(2,"Name"),i(),n(3,"th"),r(4,"Total Value"),i(),n(5,"th"),r(6,"Daily Change"),i(),n(7,"th"),r(8,"Actions"),i()())}function ke(e,l){if(e&1){let t=v();n(0,"tr")(1,"td"),r(2),i(),n(3,"td"),r(4),x(5,"currency"),i(),n(6,"td"),r(7),x(8,"percent"),i(),n(9,"td")(10,"div",10)(11,"p-button",11),u("onClick",function(){let o=c(t).$implicit,s=p(2);return m(s.onEdit(o))}),i(),n(12,"p-button",12),u("onClick",function(){let o=c(t).$implicit,s=p(2);return m(s.onDelete(o))}),i()()()()}if(e&2){let t=l.$implicit;d(2),_(t.name),d(2),_(f(5,3,t.totalValue)),d(3),_(f(8,5,t.dailyChange))}}function Ve(e,l){e&1&&(n(0,"tr")(1,"td",13),r(2,"No holdings found."),i()())}function ze(e,l){if(e&1&&(H(0),h(1,Me,4,0,"ng-template",3),n(2,"p-table",4),h(3,Ie,9,0,"ng-template",3)(4,ke,13,7,"ng-template",5)(5,Ve,3,0,"ng-template",6),i(),T()),e&2){let t=p();d(2),g("value",t.holdings)("paginator",!0)("rows",10)("showCurrentPageReport",!0)("rowsPerPageOptions",V(5,Ce))}}function Pe(e,l){if(e&1){let t=v();n(0,"div",7)(1,"h2",8),r(2,"Holdings Details"),i(),n(3,"div",10)(4,"p-button",25),u("onClick",function(){c(t);let o=p(2);return m(o.onEdit())}),i(),n(5,"p-button",26),u("onClick",function(){c(t);let o=p(2);return m(o.onDelete())}),i(),n(6,"p-button",27),u("onClick",function(){c(t);let o=p(2);return m(o.backToList())}),i()()()}}function De(e,l){e&1&&(n(0,"div",28)(1,"h3",8),r(2,"Total Value"),i()())}function Fe(e,l){e&1&&(n(0,"div",28)(1,"h3",8),r(2,"Daily Change"),i()())}function Be(e,l){e&1&&(n(0,"tr")(1,"th"),r(2,"Symbol"),i(),n(3,"th"),r(4,"Shares"),i(),n(5,"th"),r(6,"Avg. Price"),i(),n(7,"th"),r(8,"Current Price"),i(),n(9,"th"),r(10,"Value"),i(),n(11,"th"),r(12,"Change"),i()())}function Re(e,l){if(e&1&&(n(0,"tr")(1,"td"),r(2),i(),n(3,"td"),r(4),i(),n(5,"td"),r(6),x(7,"currency"),i(),n(8,"td"),r(9),x(10,"currency"),i(),n(11,"td"),r(12),x(13,"currency"),i(),n(14,"td",29),r(15),x(16,"percent"),i()()),e&2){let t=l.$implicit;d(2),_(t.symbol),d(2),_(t.shares),d(2),_(f(7,7,t.avgPrice)),d(3),_(f(10,9,t.currentPrice)),d(3),_(f(13,11,t.value)),d(2),g("ngClass",z(15,ye,t.change>0,t.change<0)),d(),C(" ",f(16,13,t.change)," ")}}function Ne(e,l){e&1&&(n(0,"tr")(1,"td",30),r(2,"No holdings found."),i()())}function Oe(e,l){if(e&1){let t=v();H(0),h(1,Pe,7,0,"ng-template",3),n(2,"div",0)(3,"div",14)(4,"div",15)(5,"div",16)(6,"label",17),r(7,"Name"),i(),n(8,"input",18),k("ngModelChange",function(o){c(t);let s=p();return I(s.selectedHolding.name,o)||(s.selectedHolding.name=o),m(o)}),i()(),n(9,"div",16)(10,"label",19),r(11,"Description"),i(),n(12,"textarea",20),k("ngModelChange",function(o){c(t);let s=p();return I(s.selectedHolding.description,o)||(s.selectedHolding.description=o),m(o)}),i()()()(),n(13,"div",14)(14,"div",0)(15,"div",21)(16,"p-card",22),h(17,De,3,0,"ng-template",3),n(18,"div",23),r(19),x(20,"currency"),i()()(),n(21,"div",21)(22,"p-card",22),h(23,Fe,3,0,"ng-template",3),n(24,"div",24),r(25),x(26,"percent"),i()()()()()(),A(27,"p-divider"),n(28,"h3"),r(29,"Holdings"),i(),n(30,"p-table",4),h(31,Be,13,0,"ng-template",3)(32,Re,17,18,"ng-template",5)(33,Ne,3,0,"ng-template",6),i(),T()}if(e&2){let t=p();d(8),M("ngModel",t.selectedHolding.name),g("disabled",!0),d(4),M("ngModel",t.selectedHolding.description),g("disabled",!0),d(7),C(" ",f(20,12,t.selectedHolding.totalValue)," "),d(5),g("ngClass",z(16,ye,t.selectedHolding.dailyChange>0,t.selectedHolding.dailyChange<0)),d(),C(" ",f(26,14,t.selectedHolding.dailyChange)," "),d(5),g("value",t.selectedHolding.holdings)("paginator",!0)("rows",10)("showCurrentPageReport",!0)("rowsPerPageOptions",V(19,Ce))}}var ft=(()=>{let l=class l{constructor(a,o){this.route=a,this.router=o,this.selectedHoldingId=null,this.holdings=[],this.selectedHolding={id:"",name:"",description:"",totalValue:0,dailyChange:0,holdings:[]}}ngOnInit(){this.route.params.subscribe(a=>{this.selectedHoldingId=a.id||null,this.selectedHoldingId?this.selectedHolding={id:this.selectedHoldingId,name:"Sample Holding",description:"This is a sample holding group",totalValue:1e4,dailyChange:.05,holdings:[{symbol:"AAPL",shares:10,avgPrice:150,currentPrice:160,value:1600,change:.067}]}:this.holdings=[{id:"1",name:"Tech Stocks",description:"Technology sector investments",totalValue:1e4,dailyChange:.05,holdings:[]},{id:"2",name:"Financial Stocks",description:"Financial sector investments",totalValue:8e3,dailyChange:-.02,holdings:[]}]})}onNewHolding(){}onEdit(a){a&&this.router.navigate(["/holdings",a.id])}onDelete(a){}backToList(){this.router.navigate(["/holdings"])}};l.\u0275fac=function(o){return new(o||l)(E(K),E(Q))},l.\u0275cmp=F({type:l,selectors:[["app-holdings"]],decls:5,vars:2,consts:[[1,"grid"],[1,"col-12"],[4,"ngIf"],["pTemplate","header"],["currentPageReportTemplate","Showing {first} to {last} of {totalRecords} holdings",3,"value","paginator","rows","showCurrentPageReport","rowsPerPageOptions"],["pTemplate","body"],["pTemplate","emptymessage"],[1,"flex","justify-content-between","align-items-center","p-3"],[1,"m-0"],["label","New Holding","icon","pi pi-plus",3,"onClick"],[1,"flex","gap-2"],["icon","pi pi-pencil","styleClass","p-button-rounded p-button-text",3,"onClick"],["icon","pi pi-trash","styleClass","p-button-rounded p-button-text p-button-danger",3,"onClick"],["colspan","4",1,"text-center"],[1,"col-12","md:col-6"],[1,"p-fluid"],[1,"field"],["for","name"],["pInputText","","id","name",3,"ngModelChange","ngModel","disabled"],["for","description"],["pInputTextarea","","id","description","rows","3",3,"ngModelChange","ngModel","disabled"],[1,"col-6"],["styleClass","h-full"],[1,"text-center","text-2xl","font-bold"],[1,"text-center","text-2xl","font-bold",3,"ngClass"],["label","Edit","icon","pi pi-pencil",3,"onClick"],["label","Delete","icon","pi pi-trash","styleClass","p-button-danger",3,"onClick"],["label","Back to List","icon","pi pi-arrow-left","styleClass","p-button-secondary",3,"onClick"],[1,"text-center","p-3"],[3,"ngClass"],["colspan","6",1,"text-center"]],template:function(o,s){o&1&&(n(0,"div",0)(1,"div",1)(2,"p-card"),h(3,ze,6,6,"ng-container",2)(4,Oe,34,20,"ng-container",2),i()()()),o&2&&(d(3),g("ngIf",!s.selectedHoldingId),d(),g("ngIf",s.selectedHoldingId))},dependencies:[J,$,G,Y,q,U,se,de,X,ne,te,ue,ge,me,ce,be,ve,xe,_e,le,ie,re,ae],styles:["[_nghost-%COMP%]     .p-card .p-card-content{padding:1rem}[_nghost-%COMP%]     .text-green-500{color:var(--green-500)}[_nghost-%COMP%]     .text-red-500{color:var(--red-500)}[_nghost-%COMP%]     .p-button-rounded{width:2.5rem;height:2.5rem}"]});let e=l;return e})();export{ft as HoldingsComponent};
