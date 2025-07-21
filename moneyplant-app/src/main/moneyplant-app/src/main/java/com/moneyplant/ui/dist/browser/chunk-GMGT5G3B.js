import{f as de,g as se}from"./chunk-BQZL6LVE.js";import{k as ee,l as te,m as ie,p as y,s as ne,u as re,v as le}from"./chunk-LUZOZIDA.js";import{a as ce,b as pe}from"./chunk-WABIGCBO.js";import{a as oe,b as ae}from"./chunk-YB3EN6CN.js";import{Fa as X,Ga as Z,ia as J,ma as K,oa as Q}from"./chunk-XBYO5J67.js";import{i as Y,k as q,p as G}from"./chunk-BCYXNNE7.js";import{$a as x,Ab as c,Fc as j,Ic as A,Ka as d,Lb as N,Ob as a,Oc as L,Pa as v,Pb as _,Pc as W,Qb as b,Rc as U,S as k,Tb as w,Ub as H,Va as D,Vb as I,Wb as O,X as P,Xa as F,Xb as T,Za as z,Zb as M,aa as p,ba as m,bb as R,ec as f,fc as h,ma as $,qb as g,rb as i,sb as n,tb as B,ub as S,uc as V,vb as E,xb as C,zb as u}from"./chunk-E5FNFP2Z.js";import"./chunk-JKOY2XUY.js";var ve=({dt:e})=>`
.p-textarea {
    font-family: inherit;
    font-feature-settings: inherit;
    font-size: 1rem;
    color: ${e("textarea.color")};
    background: ${e("textarea.background")};
    padding: ${e("textarea.padding.y")} ${e("textarea.padding.x")};
    border: 1px solid ${e("textarea.border.color")};
    transition: background ${e("textarea.transition.duration")}, color ${e("textarea.transition.duration")}, border-color ${e("textarea.transition.duration")}, outline-color ${e("textarea.transition.duration")}, box-shadow ${e("textarea.transition.duration")};
    appearance: none;
    border-radius: ${e("textarea.border.radius")};
    outline-color: transparent;
    box-shadow: ${e("textarea.shadow")};
}

.p-textarea:enabled:hover {
    border-color: ${e("textarea.hover.border.color")};
}

.p-textarea:enabled:focus {
    border-color: ${e("textarea.focus.border.color")};
    box-shadow: ${e("textarea.focus.ring.shadow")};
    outline: ${e("textarea.focus.ring.width")} ${e("textarea.focus.ring.style")} ${e("textarea.focus.ring.color")};
    outline-offset: ${e("textarea.focus.ring.offset")};
}

.p-textarea.p-invalid {
    border-color: ${e("textarea.invalid.border.color")};
}

.p-textarea.p-variant-filled {
    background: ${e("textarea.filled.background")};
}

.p-textarea.p-variant-filled:enabled:focus {
    background: ${e("textarea.filled.focus.background")};
}

.p-textarea:disabled {
    opacity: 1;
    background: ${e("textarea.disabled.background")};
    color: ${e("textarea.disabled.color")};
}

.p-textarea::placeholder {
    color: ${e("textarea.placeholder.color")};
}

.p-textarea-fluid {
    width: 100%;
}

.p-textarea-resizable {
    overflow: hidden;
    resize: none;
}

.p-textarea.ng-invalid.ng-dirty {
    border-color: ${e("textarea.invalid.border.color")}
}

.p-textarea.ng-invalid.ng-dirty::placeholder {
    color: ${e("textarea.invalid.placeholder.color")};
}`,Ce={root:({instance:e,props:r})=>["p-textarea p-component",{"p-filled":e.filled,"p-textarea-resizable ":r.autoResize,"p-invalid":r.invalid,"p-variant-filled":r.variant?r.variant==="filled":e.config.inputStyle==="filled"||e.config.inputVariant==="filled","p-textarea-fluid":r.fluid}]},me=(()=>{class e extends K{name="textarea";theme=ve;classes=Ce;static \u0275fac=(()=>{let t;return function(o){return(t||(t=$(e)))(o||e)}})();static \u0275prov=k({token:e,factory:e.\u0275fac})}return e})();var ge=(()=>{class e extends Q{ngModel;control;autoResize;variant;fluid=!1;onResize=new R;filled;cachedScrollHeight;ngModelSubscription;ngControlSubscription;_componentStyle=P(me);constructor(t,l){super(),this.ngModel=t,this.control=l,console.log("pInputTextarea directive is deprecated in v18. Use pTextarea directive instead")}ngOnInit(){super.ngOnInit(),this.ngModel&&(this.ngModelSubscription=this.ngModel.valueChanges.subscribe(()=>{this.updateState()})),this.control&&(this.ngControlSubscription=this.control.valueChanges.subscribe(()=>{this.updateState()}))}get hasFluid(){let l=this.el.nativeElement.closest("p-fluid");return this.fluid||!!l}ngAfterViewInit(){super.ngAfterViewInit(),this.autoResize&&this.resize(),this.updateFilledState(),this.cd.detectChanges()}onInput(t){this.updateState()}updateFilledState(){this.filled=this.el.nativeElement.value&&this.el.nativeElement.value.length}resize(t){this.el.nativeElement.style.height="auto",this.el.nativeElement.style.height=this.el.nativeElement.scrollHeight+"px",parseFloat(this.el.nativeElement.style.height)>=parseFloat(this.el.nativeElement.style.maxHeight)?(this.el.nativeElement.style.overflowY="scroll",this.el.nativeElement.style.height=this.el.nativeElement.style.maxHeight):this.el.nativeElement.style.overflow="hidden",this.onResize.emit(t||{})}updateState(){this.updateFilledState(),this.autoResize&&this.resize()}ngOnDestroy(){this.ngModelSubscription&&this.ngModelSubscription.unsubscribe(),this.ngControlSubscription&&this.ngControlSubscription.unsubscribe(),super.ngOnDestroy()}static \u0275fac=function(l){return new(l||e)(v(y,8),v(te,8))};static \u0275dir=F({type:e,selectors:[["","pInputTextarea",""]],hostAttrs:[1,"p-textarea","p-component"],hostVars:8,hostBindings:function(l,o){l&1&&u("input",function(fe){return o.onInput(fe)}),l&2&&N("p-filled",o.filled)("p-textarea-resizable",o.autoResize)("p-variant-filled",o.variant==="filled"||o.config.inputStyle()==="filled"||o.config.inputVariant()==="filled")("p-textarea-fluid",o.hasFluid)},inputs:{autoResize:[2,"autoResize","autoResize",V],variant:"variant",fluid:[2,"fluid","fluid",V]},outputs:{onResize:"onResize"},features:[O([me]),z]})}return e})();var ue=()=>[10,25,50],_e=(e,r)=>({"text-green-500":e,"text-red-500":r});function be(e,r){if(e&1){let t=C();i(0,"div",7)(1,"h2",8),a(2,"Holdings"),n(),i(3,"p-button",9),u("onClick",function(){p(t);let o=c(2);return m(o.onNewHolding())}),n()()}}function ye(e,r){e&1&&(i(0,"tr")(1,"th"),a(2,"Name"),n(),i(3,"th"),a(4,"Total Value"),n(),i(5,"th"),a(6,"Daily Change"),n(),i(7,"th"),a(8,"Actions"),n()())}function Se(e,r){if(e&1){let t=C();i(0,"tr")(1,"td"),a(2),n(),i(3,"td"),a(4),f(5,"currency"),n(),i(6,"td"),a(7),f(8,"percent"),n(),i(9,"td")(10,"div",10)(11,"p-button",11),u("onClick",function(){let o=p(t).$implicit,s=c(2);return m(s.onEdit(o))}),n(),i(12,"p-button",12),u("onClick",function(){let o=p(t).$implicit,s=c(2);return m(s.onDelete(o))}),n()()()()}if(e&2){let t=r.$implicit;d(2),_(t.name),d(2),_(h(5,3,t.totalValue)),d(3),_(h(8,5,t.dailyChange))}}function Ee(e,r){e&1&&(i(0,"tr")(1,"td",13),a(2,"No holdings found."),n()())}function we(e,r){if(e&1&&(S(0),x(1,be,4,0,"ng-template",3),i(2,"p-table",4),x(3,ye,9,0,"ng-template",3)(4,Se,13,7,"ng-template",5)(5,Ee,3,0,"ng-template",6),n(),E()),e&2){let t=c();d(2),g("value",t.holdings)("paginator",!0)("rows",10)("showCurrentPageReport",!0)("rowsPerPageOptions",T(5,ue))}}function He(e,r){if(e&1){let t=C();i(0,"div",7)(1,"h2",8),a(2,"Holdings Details"),n(),i(3,"div",10)(4,"p-button",25),u("onClick",function(){p(t);let o=c(2);return m(o.onEdit())}),n(),i(5,"p-button",26),u("onClick",function(){p(t);let o=c(2);return m(o.onDelete())}),n(),i(6,"p-button",27),u("onClick",function(){p(t);let o=c(2);return m(o.backToList())}),n()()()}}function Ie(e,r){e&1&&(i(0,"div",28)(1,"h3",8),a(2,"Total Value"),n()())}function Te(e,r){e&1&&(i(0,"div",28)(1,"h3",8),a(2,"Daily Change"),n()())}function Me(e,r){e&1&&(i(0,"tr")(1,"th"),a(2,"Symbol"),n(),i(3,"th"),a(4,"Shares"),n(),i(5,"th"),a(6,"Avg. Price"),n(),i(7,"th"),a(8,"Current Price"),n(),i(9,"th"),a(10,"Value"),n(),i(11,"th"),a(12,"Change"),n()())}function Ve(e,r){if(e&1&&(i(0,"tr")(1,"td"),a(2),n(),i(3,"td"),a(4),n(),i(5,"td"),a(6),f(7,"currency"),n(),i(8,"td"),a(9),f(10,"currency"),n(),i(11,"td"),a(12),f(13,"currency"),n(),i(14,"td",29),a(15),f(16,"percent"),n()()),e&2){let t=r.$implicit;d(2),_(t.symbol),d(2),_(t.shares),d(2),_(h(7,7,t.avgPrice)),d(3),_(h(10,9,t.currentPrice)),d(3),_(h(13,11,t.value)),d(2),g("ngClass",M(15,_e,t.change>0,t.change<0)),d(),b(" ",h(16,13,t.change)," ")}}function ke(e,r){e&1&&(i(0,"tr")(1,"td",30),a(2,"No holdings found."),n()())}function Pe(e,r){if(e&1){let t=C();S(0),x(1,He,7,0,"ng-template",3),i(2,"div",0)(3,"div",14)(4,"div",15)(5,"div",16)(6,"label",17),a(7,"Name"),n(),i(8,"input",18),I("ngModelChange",function(o){p(t);let s=c();return H(s.selectedHolding.name,o)||(s.selectedHolding.name=o),m(o)}),n()(),i(9,"div",16)(10,"label",19),a(11,"Description"),n(),i(12,"textarea",20),I("ngModelChange",function(o){p(t);let s=c();return H(s.selectedHolding.description,o)||(s.selectedHolding.description=o),m(o)}),n()()()(),i(13,"div",14)(14,"div",0)(15,"div",21)(16,"p-card",22),x(17,Ie,3,0,"ng-template",3),i(18,"div",23),a(19),f(20,"currency"),n()()(),i(21,"div",21)(22,"p-card",22),x(23,Te,3,0,"ng-template",3),i(24,"div",24),a(25),f(26,"percent"),n()()()()()(),B(27,"p-divider"),i(28,"h3"),a(29,"Holdings"),n(),i(30,"p-table",4),x(31,Me,13,0,"ng-template",3)(32,Ve,17,18,"ng-template",5)(33,ke,3,0,"ng-template",6),n(),E()}if(e&2){let t=c();d(8),w("ngModel",t.selectedHolding.name),g("disabled",!0),d(4),w("ngModel",t.selectedHolding.description),g("disabled",!0),d(7),b(" ",h(20,12,t.selectedHolding.totalValue)," "),d(5),g("ngClass",M(16,_e,t.selectedHolding.dailyChange>0,t.selectedHolding.dailyChange<0)),d(),b(" ",h(26,14,t.selectedHolding.dailyChange)," "),d(5),g("value",t.selectedHolding.holdings)("paginator",!0)("rows",10)("showCurrentPageReport",!0)("rowsPerPageOptions",T(19,ue))}}var st=(()=>{let r=class r{constructor(l,o){this.route=l,this.router=o,this.selectedHoldingId=null,this.holdings=[],this.selectedHolding={id:"",name:"",description:"",totalValue:0,dailyChange:0,holdings:[]}}ngOnInit(){this.route.params.subscribe(l=>{this.selectedHoldingId=l.id||null,this.selectedHoldingId?this.selectedHolding={id:this.selectedHoldingId,name:"Sample Holding",description:"This is a sample holding group",totalValue:1e4,dailyChange:.05,holdings:[{symbol:"AAPL",shares:10,avgPrice:150,currentPrice:160,value:1600,change:.067}]}:this.holdings=[{id:"1",name:"Tech Stocks",description:"Technology sector investments",totalValue:1e4,dailyChange:.05,holdings:[]},{id:"2",name:"Financial Stocks",description:"Financial sector investments",totalValue:8e3,dailyChange:-.02,holdings:[]}]})}onNewHolding(){}onEdit(l){l&&this.router.navigate(["/holdings",l.id])}onDelete(l){}backToList(){this.router.navigate(["/holdings"])}};r.\u0275fac=function(o){return new(o||r)(v(Y),v(q))},r.\u0275cmp=D({type:r,selectors:[["app-holdings"]],decls:5,vars:2,consts:[[1,"grid"],[1,"col-12"],[4,"ngIf"],["pTemplate","header"],["currentPageReportTemplate","Showing {first} to {last} of {totalRecords} holdings",3,"value","paginator","rows","showCurrentPageReport","rowsPerPageOptions"],["pTemplate","body"],["pTemplate","emptymessage"],[1,"flex","justify-content-between","align-items-center","p-3"],[1,"m-0"],["label","New Holding","icon","pi pi-plus",3,"onClick"],[1,"flex","gap-2"],["icon","pi pi-pencil","styleClass","p-button-rounded p-button-text",3,"onClick"],["icon","pi pi-trash","styleClass","p-button-rounded p-button-text p-button-danger",3,"onClick"],["colspan","4",1,"text-center"],[1,"col-12","md:col-6"],[1,"p-fluid"],[1,"field"],["for","name"],["pInputText","","id","name",3,"ngModelChange","ngModel","disabled"],["for","description"],["pInputTextarea","","id","description","rows","3",3,"ngModelChange","ngModel","disabled"],[1,"col-6"],["styleClass","h-full"],[1,"text-center","text-2xl","font-bold"],[1,"text-center","text-2xl","font-bold",3,"ngClass"],["label","Edit","icon","pi pi-pencil",3,"onClick"],["label","Delete","icon","pi pi-trash","styleClass","p-button-danger",3,"onClick"],["label","Back to List","icon","pi pi-arrow-left","styleClass","p-button-secondary",3,"onClick"],[1,"text-center","p-3"],[3,"ngClass"],["colspan","6",1,"text-center"]],template:function(o,s){o&1&&(i(0,"div",0)(1,"div",1)(2,"p-card"),x(3,we,6,6,"ng-container",2)(4,Pe,34,20,"ng-container",2),n()()()),o&2&&(d(3),g("ngIf",!s.selectedHoldingId),d(),g("ngIf",s.selectedHoldingId))},dependencies:[U,j,A,L,W,G,ae,oe,J,Z,X,se,de,le,re,ge,pe,ce,ne,ee,ie,y],styles:["[_nghost-%COMP%]     .p-card .p-card-content{padding:1rem}[_nghost-%COMP%]     .text-green-500{color:var(--green-500)}[_nghost-%COMP%]     .text-red-500{color:var(--red-500)}[_nghost-%COMP%]     .p-button-rounded{width:2.5rem;height:2.5rem}"]});let e=r;return e})();export{st as HoldingsComponent};
