define(['inherit'], function(inherit) {
	var EJSON = window.JSON;
	var STORE = window.localStorage;
	var AbstractStorage = new inherit.Class({
		__propertys__: function() {
			/*
			 * 存储缓存中的key和过期时间
			 * @type {string}
			 */
			this.overdueClearKey = "C_ClEAR_OVERDUE_CATCH";
			this.date = new Date();
		},
		initialize: function ($super, options) {

	  	},
	  	//
	  	_get:function(key,tag){
			var result, value = null;
			result = STORE.gitItem(key);
			if(result){
				result = EJSON.parse(result);
				var st = Date.parse(result.timeout);
				if(new Date(st) > new Date()){
					if(tag){
						if(tag === result.tag){
							value = result.value;
						}
					}else{
						value = result.value;
					}
				}
			}
			return value;
	  	},
	  	//
	  	_set:function(key, value, timeout, tag, savedate){
	  		savedate = savedate || new Date();
	  		timeout = timeout ? new Date(timeout) : this.date.setDate(this.date.getDate()+30);
	  		try{
	  			STORE.setItem(key,EJSON.stringify({
	  				value:value,
	  				timeout:timeout,
	  				savedate:savedate,
	  				tag:tag
	  			}));
	  		}catch(e){
	  			if(e.name === 'QuotaExceededError'){
	  				//缓存满了删除过期的
	  				this.set(key, value, timeout, tag, savedate);
	  			}
	  		}
	  		this._setSaveStore(key,timeout);
	  	},
	  	_setSaveStore:function(key,timeout){
	  		if(!key || !timeout || timeout < new Date()){
	  			return;
	  		}
	  		//获取缓存key的集合
	  		var storeArr = STORE.getItem(this.overdueClearKey);
	  		storeArr = storeArr && JSON.parse(storeArr) || [];
	  		var newStore = {
	  			key:key,
	  			timeout:timeout
	  		}
	  		var isExist = false;
	  		for(var i=0;i<storeArr.length;i++){
	  			if(storeArr[i].key === key){
	  				storeArr[i] = newStore;
	  				isExist = true;
	  				return false;
	  			}
	  		}
	  		if(!isExist){
	  			storeArr.push(newStore);
	  		}
	  		STORE.setItem(this.overdueClearKey, JSON.stringify(storeArr));
	  	}，
	  	_removeStore:function(num){
	  		num = num || 5;
	  		var storeArr = STORE.getItem(this.overdueClearKey);
	  		storeArr = storeArr && JSON.parse(storeArr) || [];
	  		if(storeArr.length){
	  			storeArr.sort(function(a,b){
	  				return a.timeout - b.timeout;
	  			});
	  			//要删除的
	  		}
	  	}
	});
})