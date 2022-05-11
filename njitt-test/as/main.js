// JavaScript Document
 
//下拉框
window.onload = function(){
	sslct()
}
function sslct() {
	var oSearch = document.getElementById("sslct_main");
	var aDiv = oSearch.getElementsByTagName("*");
	var aSslct = getClass(aDiv,"sslct");
	var aTxt_sslct = getClass(aDiv,"butten_r");
	var aList_sslct = getClass(aDiv,"list_sslct");
	var target = new Array();
	for(i=0;i<aList_sslct.length;i++){
		aList_sslct[i].style.height = "auto";
		target[i] = aList_sslct[i].offsetHeight;
		aList_sslct[i].style.height = "0px";	
	}
	for(i=0;i<aSslct.length;i++){
		aSslct[i].index = i;
		aSslct[i].onclick = function(){
			$('sslct').removeClass('on');
			$(this).addClass("on");
			var cur = this.index;
			for(i=0;i<aSslct.length;i++){
				move(aList_sslct[i],{height:0});
			}
			move(aList_sslct[cur],{height:target[cur]});
			var aLi = aList_sslct[cur].getElementsByTagName("li");
			for(i=0;i<aLi.length;i++){
				aLi[i].onclick = function(){
					//aTxt_sslct[cur].innerHTML = this.getElementsByTagName("a")[0].innerHTML;
					//var searchtype = $(this).attr("value");
					//$("#searchtype").val(searchtype);
				}
			}
			document.onclick = function(){
				for(i=0;i<aSslct.length;i++){
					if(aList_sslct[i].style.height != "0px"){
						move(aList_sslct[i],{height:0});
					}
				}
			}
		}
	}
}
 