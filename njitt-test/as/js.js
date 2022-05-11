function getClass(arr,className){
	var tempArr = new Array();
	for(i=0;i<arr.length;i++){
		if(arr[i].className == className){
			tempArr.push(arr[i]);
		}
	}
	return tempArr;
}
function getStyle(obj,attr){
	if(obj.currentStyle){
		return obj.currentStyle[attr];
	}
	else{
		return getComputedStyle(obj,false)[attr];
	}
}
function move(obj,json,fn){
	clearInterval(obj.timer);
	obj.timer = setInterval(function(){
		var state = true;
		for(attr in json){
			var cur = parseInt(getStyle(obj,attr));
			if(attr == "opacity"){
				cur = parseFloat(getStyle(obj,attr));
				cur *= 100;
				cur = parseInt(cur);
			}
			var speed = (json[attr] - cur) / 4;
			speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
			if(cur != speed){
				state = false;
			}
			cur += speed;
			if(attr == "opacity"){
				obj.style.opacity = cur / 100;
				obj.style.filter = "alpha(opacity=" + cur + ")";
			}
			else{
				obj.style[attr] = cur + "px";
			}
		}
		if(state){
			clearInterval(obj.timer);
			if(fn){
				fn();
			}
		}
	},20)
}
function popMove(obj,attr,target){
	clearInterval(obj.timer);
	var speed = 0;
	var cur = parseInt(getStyle(obj,attr));
	obj.timer = setInterval(function(){
		speed += (target - cur) / 5;
		speed *= 0.7;
		if(Math.abs(speed) < 1 && Math.abs(target - cur) < 1){
			clearInterval(obj.timer);
			cur = target;
		}
		else{
			cur += speed;
		}
		obj.style[attr] = cur + "px";
	},30)
}
//构造最终要ajax提交的链接（baseUrl:基础url；className:要提交值的标签class)
function makeUrl(baseUrl ,className){
	var first = true;
	$("."+className).each(function(){
		if(first){
			baseUrl = baseUrl + "?";
			first = false;
		}else{
			baseUrl = baseUrl + "&";
		}
		//var value = encodeURI($(this).val());
		var value = encodeURIComponent($(this).val());
		if($(this).attr("name")!=null&&$(this).attr("name")!=''){
			baseUrl = baseUrl + $(this).attr("name")+"="+value;
		}
	});
	return baseUrl;
}
//ajax get方式提交，并解析返回结果，并输出
//isRefresh:如果返回成功，是否刷新
function ajaxGetSubit(url ,isRefresh){
	$.get(url, function(data){
	    var result = data.result;
	    alert(data.msg);
	    if(result=="1"){
	    	if(isRefresh){
	    		window.location.reload();
	    	}
	    };
	  });
}
//ajax get方式提交，并解析返回结果，并输出
//isRefresh:如果返回成功，是否刷新
//isUnlock:如果true，那么在ajax传输期间会锁屏
function ajaxGetSubit2(url ,isRefresh,isUnlock){
	if(isUnlock){
	    $.blockUI({ message: '<h1>正在提交，请稍等片刻...</h1>' });
	}
	$.get(url, function(data){
	    var result = data.result;
	    if(isUnlock){
	    	 $.unblockUI();
	    }
	    alert(data.msg);
	    if(result=="1"){
	    	if(isRefresh){
	    		window.location.reload();
	    	}
	    };
	  });
}