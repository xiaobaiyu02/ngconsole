angular.module("vdi.scheduler", [])

.factory("Scheduler", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/classScheduler", { pool_id: "@pool_id" }, {
		get: { method: "GET" },
		save: { method: "POST" },
		getConfig: { method: "GET", url: $Domain + "/thor/classSchedulerConfig" },
		updateConfig: { method: "PUT", url: $Domain + "/thor/classSchedulerConfig" }
	});
}])

.config(["$filterProvider", function($filterProvider){
	var num_day = 3600 * 1000 * 24;
	$filterProvider.register("weekChecked", function(){
		return function(items, checked){
			if(!items instanceof Array) return items;
			checked = Boolean(checked);
			return items.filter(function(item){
				return item.checked === checked;
			});
		};
	});
	$filterProvider.register("getWeeks", function(){
		return function(items, start, end){
			if(!items instanceof Array) return items;
			var start_time_week_start_time = start - num_day * start.getDay();
			var start_time_week_end_time = start_time_week_start_time + num_day * 7;
			var end_time_week_start_time = end - num_day * end.getDay();
			var end_time_week_end_time = end_time_week_start_time + num_day * 7;
			var weeks = [];
			var span = end_time_week_end_time - start_time_week_start_time;
			while(span > 0){
				weeks.push({
					name: "第" + (weeks.length + 1) + "周",
					start: start_time_week_start_time + weeks.length * num_day * 7,
					end: start_time_week_end_time + weeks.length * num_day * 7,
					checked: false,
					disabled: false
				});
				span -= num_day * 7;
			}
			return weeks;
		};
	});
}])
.directive("schedulerweek", function(){
	return {
		restrict: "E",
		//require: "^vdiSchedulerViewController",
		template: '<div class="btn btn-md vdi_scheduler_week_button" ng-class="{disabled: week.disabled,\'btn-primary\': week.selected, \'btn-default\': !week.selected}" \
			ng-click="week.checked = !week.checked;">\
			<label class="checkbox"><input ng-model="week.checked" type="checkbox"><i></i></label>\
			<span >{{ week.name }}</span></div>',
		scope: {
			week: "="
		},
		controller: function($scope){
			//console.log($scope);
		},
		replace: true,
		link: function($scope, ele, attrs){

		}
	};
})
.directive("schedulersceneitem", function(){
	return {
		restrict: "E",
		replace: true,
		require: ["^schedulerday", "^schedulerCanvas"],
		template: '<div class="scene_in_day_item" ng-class="{modifiable:modifiable}">\
			<div class="item_body">\
				<div class="item_dnd_body"><b>{{ scene.name }}</b></div>\
				<div class="item_dnd_header"></div>\
				<div class="item_dnd_footer"></div>\
				<a class="item_remove" ng-click="remove()"><i class="fa fa-times"></i></a>\
			</div></div>',
		scope: {
			scene: "=",
			modifiable: "="
		},
		controller: function($scope){
			let scene = $scope.scene;
			this.value = $scope.value = function(){
				return (Math.pow(2, scene.end - scene.start + 1) - 1) << (12 - scene.end);
			};
		},
		link: function(scope, ele, attr, ctrls){
			let ox = 0;
			let oy = 0;
			let enable = false;
			let day = ctrls[0];
			let canvas = ctrls[1];
			scope.remove = function(){
				scope.modifiable && day.removeChild(scope.scene);
			};
			ele.find(".item_dnd_body").mousedown(function(e){
				scope.modifiable && canvas.startSceneDND(scope.scene, e, ele);
			});
			ele.find(".item_dnd_header").mousedown(function(e){
				scope.modifiable && canvas.startSceneStartModify(scope.scene, e, ele, day.mask());
			});
			ele.find(".item_dnd_footer").mousedown(function(e){
				scope.modifiable && canvas.startSceneEndModify(scope.scene, e, ele, day.mask());
			});
			var scene = scope.scene;
			ele.css({
				top: Math.max(0, Math.min(13, (scene.start - 1))) * 48 + "px",
				height: (Math.max(1, Math.min(13, scene.end - scene.start + 1))) * 48 - 8 + "px"
			});
		}
	}
})
.directive("schedulerday", function(){
	return {
		restrict: "E",
		//require: "^vdiSchedulerViewController",
		template: '<div class="class_day">\
				<ol class="class_hour_list no_index"><li class="class_hour_cell" data-ng-repeat="classHour in classHours"></li></ol>\
				<div class="scene_in_day"><schedulerSceneItem data-modifiable="modifiable" data-scene="scene" data-ng-repeat="scene in scenes"></schedulerSceneItem></div>\
			</div>',
		replace: true,
		controller: function($scope){
			var it = this;
			this.scope = $scope;
			this.mask = $scope.mask = function(){
				return 4095 ^ $scope.scenes.reduce(function(m, scene){
					return m | (Math.pow(2, scene.end - scene.start + 1) - 1) << (12 - scene.end);
				}, 0);
			};
			this.removeChild = function(child){
				var index = $scope.scenes.indexOf(child);
				if(index > -1){
					$scope.scenes.splice(index, 1);
				}
			};
		},
		scope: {
			classHours: "=hours",
			scenes: "=scenes",
			modifiable: "="
		},
		link: function(scope, ele, attrs){}
	};
})
.directive("scheduleritems", function(){





	return {
		restrict: "E",
		//require: ["schedulerCanvas"],
		template: '<div class="jarviswidget jarviswidget-sortable">\
			<header role="heading"><h2 data-localize="添加场景排程"></h2></header>\
			<div role="content"><div style="color:#333;margin-bottom:10px;" data-localize="SCHEDULES"></div>\
				<div class="widget-body" data-ng-transclude>\
				</div>\
			</div>\
		</div>',
		controller: function($scope){
		},
		replace: true,
		transclude: true,
		link: function(scope, ele, attrs){}
	};
})
.directive("scheduleritem", function(){
	return {
		restrict: "E",
		template: '<div class="scene_item">{{ scene.name }}</div>',
		controller: function($scope){},
		require: ["^scheduleritems", "^schedulerCanvas"],
		replace: true,
		transluce: true,
		scope: {
			scene: "=",
			modifiable: "="
		},
		link: function(scope, ele, attrs, ctrls){
			var canvas = ctrls[1];
			ele.mousedown(function(e){
				scope.modifiable && canvas.startDND(scope.scene, e, ele);
			})
		}
	};
})

.directive("schedulerCanvas", ["Scene", function(){
	return {
		restrict: "A",
		controller: function($scope){
			var fn_pos_info = function(e, target){
				var cells = $scope._element.find(".class_hour_cell");
				$scope._cell_offset = cells.offset();
				$scope._cell_offset.width = cells.width();
				$scope._cell_offset.height = cells.height();
				var _t = $(target[0].cloneNode(1));
				var target_offset = target.offset();
				$scope._handler._px = e.pageX;
				$scope._handler._py = e.pageY;
				$scope._handler._fx = e.pageX - target_offset.left;
				$scope._handler._fy = e.pageY - target_offset.top;
				$scope._handler._ow = target.width();
				$scope._handler._oh = target.height();
				$scope._handler._tx = e.clientX - $scope._handler._fx;
				$scope._handler._ty = e.clientY - $scope._handler._fy;
				_t.css({
					position: "absolute",
					width: $scope._handler._ow + "px",
					height: $scope._handler._oh + "px",
					left: $scope._handler._tx + "px",
					top: $scope._handler._ty + "px"
				});
				$scope._handler._t = _t;
				$scope._handler.html("");
				$scope._handler.append(_t);
				document.body.appendChild($scope._canvas);
				//$("html body").css("overflow", "hidden");
			}
			this.startSceneDND = function(scene, domEvent, target){
				fn_pos_info(domEvent, target);
				$scope._source_scene = scene;
				$scope._event_type = "moveScene";
				$scope.$emit("moveSceneStart", scene);
				//target.remove();
			};
			this.startSceneStartModify = function(scene, domEvent, target){
				fn_pos_info(domEvent, target);
				$scope._source_scene = scene;
				$scope._event_type = "modifySceneStart";
				$scope.$emit("moveSceneStart", scene);
				//target.remove();
			};
			this.startSceneEndModify = function(scene, domEvent, target){
				fn_pos_info(domEvent, target);
				$scope._source_scene = scene;
				$scope._event_type = "modifySceneEnd";
				$scope.$emit("moveSceneStart", scene);
				//target.remove();
			};
			this.startDND = function(scene, domEvent, target){
				fn_pos_info(domEvent, target);
				$scope._source_scene = scene;
				$scope._event_type = "addNewScene";
			};
		},
		link: function(scope, ele, attrs){
			scope._element = ele;
			var fn_restore_canvas_state = function(){
				fn_move_handler_to(0, 0);
			};
			var fn_move_handler_to = function(x, y){
				handler.css("transform", "translate(" + x + "px, " + y + "px)");
			};
			var canvas = scope._canvas = $('<div class="scheduler_dnd_canvas"><div class="dnd_handler"></div><div class="dnd_masker"></div></div>')[0];
			var masker = $(".dnd_masker", canvas)
				.scroll(function(e){ e.preventDefault(); })
				.on("mousewheel", function(e){ e.preventDefault(); })
				.mousemove(function(e){
					var height;
					if(scope._event_type.indexOf("modifyScene") === 0){
						switch(scope._event_type){
							case "modifySceneStart":
								var top = Math.min(
									handler._ty + handler._oh - 40,
									Math.max(
										handler._ty - (scope._source_scene.start - 1) * 48,
										handler._ty - (handler._py - e.pageY)
									)
								);
								height = Math.min(
									(scope._source_scene.end) * 48 - 8,
									Math.max(40,
										handler._oh + handler._py - e.pageY
									)
								);
								handler._t.css({
									top: top + "px",
									height: height + "px"
								});
								handler._ns = top;
								handler._nh = height;
							break;
							case "modifySceneEnd":
								height = Math.min(
									(13 - scope._source_scene.start) * 48 - 8,
									Math.max(40,
										handler._oh + (e.pageY - handler._py)
									)
								);
								handler._t.css({
									height: height + "px"
								});
								handler._ns = handler._ty;
								handler._nh = height;
							break;
						}
					}
					else{
						fn_move_handler_to(
							e.pageX - handler._px,
							e.pageY - handler._py
						);
					}
					document.selection && document.selection.empty();
					document.getSelection && document.getSelection().removeAllRanges();
				})
				.mouseup(function(e){
					var day = (e.pageX - scope._cell_offset.left) / (scope._cell_offset.width + 1) | 0;
					var start = ((e.pageY - scope._cell_offset.top) / (scope._cell_offset.height) | 0) + 1;
					var end;
					switch(scope._event_type){
						case "addNewScene":
							end = start;
							scope.$emit("addNewScene", day, {
								start: start,
								end: end,
								pool: scope._source_scene.pool,
								mode: scope._source_scene.id
							});
						break;
						case "moveScene":
							start -= (handler._fy / scope._cell_offset.height | 0);
							scope.$emit("moveScene", day, scope._source_scene, {
								start: start,
								end: start + (scope._source_scene.end - scope._source_scene.start)
							});
						break;
						case "modifySceneStart":
						case "modifySceneEnd":
							handler._ns = handler._ns || handler._ty;
							handler._nh = handler._nh || handler._oh;
							handler._nh += 8;
							start = Math.max(1,
								Math.min(12,
									scope._source_scene.start + Math.round((handler._ns - handler._ty) / 48)
								)
							);
							end = Math.max(start,
								Math.min(12,
									start + Math.round(handler._nh / 48) - 1
								)
							);
							console.log(scope._source_scene.start, scope._source_scene.end,
									handler._oh
								);
							console.log(start, end, handler._nh, handler._nh / 48);
							scope.$emit("modifyScene", scope._source_scene, {
								start: start,
								end: end
							});
							handler._ns = handler._nh = NaN;
						break;
					}
					fn_restore_canvas_state();
					canvas.parentNode && canvas.parentNode.removeChild(canvas);
					scope._source_scene = null;
					//$("html body").css("overflow", "auto");
					scope.$emit("endModifyScene");
				})
				.mouseout(function(){
					canvas.parentNode && canvas.parentNode.removeChild(canvas);
					//$("html body").css("overflow", "auto");
					scope.$emit("endModifyScene");
				})[0];
			var handler = scope._handler = $(".dnd_handler", canvas);
			scope.$on("newScheduler", function($event, scene, offset){
			});
		}
	};
}])
.controller("vdiSchedulerViewController", [
"$scope", "Scheduler", "Scene", "SchoolRoom", "$modal", "UserRole",
function($scope, scheduler, Scene, schoolroom, $modal, UserRole){
	let user = UserRole.currentUser;
	if(user === null){ return; }
	$scope.editMode = false;
	$scope.classes = [];
	$scope.class = null;
	//$scope.start_time = new Date();
	//$scope.end_time = new Date();
	$scope.time_span = 0;
	var num_day = 3600 * 1000 * 24;

	$scope.scenes = [];
	$scope.dates = [];
	var _scenes = {};
	$scope.editWeek = null;
	schoolroom.querywithSimple(function(res){
		var schoolrooms = [];
		res.pools_.forEach(function(item){
			if(item.user_ids.some(data => data === user.id )){
				schoolrooms.push(item);
			}
		})
		$scope.classes = schoolrooms;
		$scope.class = $scope.classes[0] || null;
		Scene.query(function(res){
			$scope.scenes = res.modes;
			$scope.scenes.forEach(function(mode){
				_scenes[mode.id] = mode;
			});
			$scope.class && fn_get_scheduler($scope.class);
		});
		

	});
	// Scene.query(function(res){
	// 	console.log(this, arguments, $scope.class);
	// 	$scope.scenes = res.modes;
	// 	$scope.scenes.forEach(function(mode){
	// 		_scenes[mode.id] = mode;
	// 	});
	// 	schoolroom.query(function(res){
	// 		var schoolrooms = [];
	// 		res.pools_.forEach(function(item){
	// 			if(item.user_ids.some(data => data === user.id )){
	// 				schoolrooms.push(item);
	// 			}
	// 		})
	// 		$scope.classes = schoolrooms;
	// 		$scope.class = $scope.classes[0] || null;
	// 		$scope.class && fn_get_scheduler($scope.class);
	// 	});
	// });
	window.sss = $scope;

	var fn_update_config = function(config){
		var now = new Date(config.now);
		$scope.time_span = now.getTime() - Date.now();
		$scope.start_time = new Date(config.semester_start - (config.semester_start % num_day));
		$scope.end_time = new Date(config.semester_end - (config.semester_end % num_day));


		var week_start_day = -1;

		$scope.start_time_week_start_time = $scope.start_time - num_day * ($scope.start_time.getDay() + week_start_day);
		$scope.start_time_week_end_time = $scope.start_time_week_start_time + num_day * 7;
		$scope.end_time_week_start_time = $scope.end_time - num_day * ($scope.end_time.getDay() + week_start_day);
		$scope.end_time_week_end_time = $scope.end_time_week_start_time + num_day * 7;

		//var ymd = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("-");
		var y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
		$scope.classHours = config.period.map(function(classHour, i){
			var start = classHour[0].split(":");
			var end = classHour[1].split(":");
			return {
				index: i + 1,
				start: new Date(y, m, d, start[0], start[1]),
				end: new Date(y, m, d, end[0], end[1])
			};
		});

		var start_time = $scope.start_time.getTime();
		var end_time = $scope.end_time.getTime();
		$scope.dates.splice(0, $scope.dates.length);
		var date_start = 0;
		do{
			var date_start_time = date_start * num_day + $scope.start_time_week_start_time;
			var start_date = new Date(date_start_time);
			$scope.dates.push({
				start: date_start_time,
				start_date: start_date,
				name: "周" + "日一二三四五六"[start_date.getDay()],
				scenes: date_start_time >= start_time && date_start_time <= end_time ? [] : null
			});
			date_start ++;
		}
		while(date_start_time < end_time || $scope.dates.length % 7);

		var week_start = 0;
		$scope.weeks.splice(0);

		while(week_start * 7 < $scope.dates.length){
			var _start = $scope.start_time_week_start_time + (num_day * 7 * week_start);
			$scope.weeks.push({
				index: week_start,
				name: "第" + (week_start + 1) + "周",
				selected: false,
				start: _start,
				end: _start + num_day * 7,
				checked: false,
				disabled: _start - now < - num_day * 7,
				days: $scope.dates.slice(week_start * 7, ++ week_start * 7)
			});
		}
		var now_week = null;
		var now_day = null;
		var now_ts = Date.now() + $scope.time_span;

		now_week = $scope.weeks.filter(function(week){
			return now_ts >= week.start && now_ts < week.start + num_day * 7;
		})[0];
		now_day = now_week ? now_week.days.filter(function(day){
			return now_ts >= day.start && now_ts < day.start + num_day;
		})[0] : null;
		now_week && (now_week.current = true);
		now_day && (now_day.current = true);

		if($scope.currentWeek){
			var WEEk = $scope.weeks.filter(function(item){ return item.index == $scope.currentWeek.index })[0];
			if(WEEk){ $scope.currentWeek = WEEk; }
			else{ $scope.currentWeek = now_week; }
		}
		else{
			$scope.currentWeek = now_week;
		}
		$scope.class && fn_get_scheduler($scope.class);

		// $scope.currentWeek = $scope.currentWeek? $scope.currentWeek : now_week;
		//now_week && (now_week.checked = true);
	};

	scheduler.getConfig(function(res){
		fn_update_config(res.result);
	});

	$scope.classChange = function(){
		$scope.class && fn_get_scheduler($scope.class);
	};
	var _currentWeek = null;
	$scope.enableEditMode = function(){
		_currentWeek = $scope.currentWeek;
		$scope.currentWeek = angular.copy(_currentWeek);
		$scope.currentWeek.days.forEach(function(day){
			day.scenes = day.scenes || [];
		});
	};
	$scope.disableEditMode = function(){
		$scope.currentWeek = _currentWeek;
		$scope.editMode = false;
		$scope.weeks.forEach(function(week){
			week.checked = false;
		});
	}

	$scope.siblingWeek = function(seed){
		if($scope.currentWeek){
			$scope.currentWeek = $scope.weeks[
				Math.min($scope.weeks.length - 1, Math.max(0,
					$scope.currentWeek.index + seed
				))
			];
		}
	};
	$scope.siblingWeekState = function(seed){
		return $scope.currentWeek && $scope.weeks[$scope.currentWeek.index + seed] ? true : false;
	};


	var fn_get_scheduler = function(_class){
		scheduler.get({ pool_id: _class.id },
			function(res){
				_class.data = res.result.data;
				
				$scope.dates.forEach(function(day){
					day.scenes && day.scenes.splice(0, day.scenes.length);
				});

				Object.keys(_class.data).forEach(function(date){
					$scope.dates.forEach(function(day){
						if(date >= day.start && date - day.start < num_day){
							// console.log(day.start - date, day.start, date);
							day.scenes && _class.data[date].forEach(function(scene){
								_scenes[scene.mode_id] && day.scenes.push({
									time: day.start,
									start: scene.start_at + 1,
									end: scene.end_at + 1,
									mode: scene.mode_id,
									name: _scenes[scene.mode_id].name,
									pool: scene.pool_id
								});
							});
						}
					});
				});
			}
		);
	};

	$scope.weeks = [];
	$scope.weekCheckAll = false;
	$scope.weekCheckOdd = false;
	$scope.weekCheckEven = false;
	$scope.weekCheckSome = false;
	$scope.currentEditWeek = null;
	$scope.checkSomeWeeks = function(val){
		return $scope.weeks.some(function(week){
			return week.checked === val;
		});
	};
	$scope.checkAllWeeks = function(val){
		if(val !== undefined){
			$scope.weeks.forEach(function(week){
				week.checked = !val;
			});
		}
		else{
			if($scope.weeks.length){
				var res = $scope.weeks.every(function(week){ return week.checked });
				if(res){
					$scope.weekCheckAll = $scope.weekCheckOdd = $scope.weekCheckEven;
				}
				else{

				}
				return res;
			}
			return false;
		}
	};
	$scope.checkAllOddWeeks = function(val){
		if(val !== undefined){
			$scope.weeks.forEach(function(week, index){
				!Boolean(index % 2) && (week.checked = !val);
			});
		}
		else{
			if($scope.weeks.length){
				var res = $scope.weeks.every(function(week, index){
					return Boolean(index % 2) || week.checked;
				});
				$scope.weekCheckOdd = res;
				$scope.weekCheckAll = $scope.weekCheckOdd && $scope.weekCheckEven;
				return res;
			}
			return false;
		}
	};
	$scope.checkAllEvenWeeks = function(val){
		if(val !== undefined){
			$scope.weeks.forEach(function(week, index){
				Boolean(index % 2) && (week.checked = !val);
			});
		}
		else{
			if($scope.weeks.length){
				var res = $scope.weeks.every(function(week, index){
					return !Boolean(index % 2) || week.checked;
				});
				$scope.weekCheckEven = res;
				$scope.weekCheckAll = $scope.weekCheckOdd && $scope.weekCheckEven;
				return res;
			}
			return false;
		}
	};

	$scope.$on("moveSceneStart", function(de, scene){
		$scope.currentWeek.days.forEach(function(day){
			var index = day.scenes ? day.scenes.indexOf(scene) : -1;
			if(index > -1){
				day.moving_scene = day.scenes.splice(index, 1);
			}
		});
		$scope.$apply();
	});
	$scope.$on("moveScene", function(de, day, scene, newScene){
		var _day = $scope.currentWeek.days[day];
		if(_day && _day.scenes){
			var m = 4095 ^ _day.scenes.reduce(function(m, scene){
				return m | (Math.pow(2, scene.end - scene.start + 1) - 1) << (12 - scene.end);
			}, 0);
			var data = (Math.pow(2, newScene.end - newScene.start + 1) - 1) << (12 - newScene.end);
			if((m & data) === data){
				scene.start = newScene.start;
				scene.end = newScene.end;
				_day.scenes.push(scene);
				$scope.currentWeek.days.forEach(function(day){
					day.moving_scene = undefined;
					delete day.moving_scene;
				});
			}
		}
	});

	$scope.$on("modifyScene", function(de, scene, newScene){
		var _day = $scope.currentWeek.days.filter(function(day){ return day.moving_scene })[0];
		if(_day && _day.scenes){
			var m = 4095 ^ _day.scenes.reduce(function(m, scene){
				return m | (Math.pow(2, scene.end - scene.start + 1) - 1) << (12 - scene.end);
			}, 0);
			var data = (Math.pow(2, newScene.end - newScene.start + 1) - 1) << (12 - newScene.end);
			if((m & data) === data){
				scene.start = newScene.start;
				scene.end = newScene.end;
				//_day.scenes.push(scene);
			}
		}
	});

	$scope.$on("endModifyScene", function(){
		$scope.currentWeek.days.forEach(function(day){
			if(day.moving_scene){
				day.scenes.push.apply(day.scenes, day.moving_scene);
				day.moving_scene = undefined;
				delete day.moving_scene;
			}
		});
		$scope.$apply();
	});

	$scope.$on("addNewScene", function(de, day, scene){
		var _day = $scope.currentWeek.days[day];
		if(_day && _day.scenes){
			var m = 4095 ^ _day.scenes.reduce(function(m, scene){
				return m | (Math.pow(2, scene.end - scene.start + 1) - 1) << (12 - scene.end);
			}, 0);
			var data = (Math.pow(2, scene.end - scene.start + 1) - 1) << (12 - scene.end);
			if((m & data) === data){
				scene.time = _day.start;
				scene.name = _scenes[scene.mode].name;
				_day.scenes.push(scene);
				$scope.$apply();
			}
		}
	});
	$scope.currentWeek = null;

	$scope.selectWeek = function(week){
		$scope.currentWeek = week;
	};
	$scope.clearData = function(){
		scheduler.save({
			timezone_offset: new Date().getTimezoneOffset(),
			pool_id: $scope.class.id,
			data: []
		}, function(res){
			$scope.disableEditMode();
		});
	};
	$scope.save = function(){
		//console.log($scope.dates);
		var data = [];
		$scope.weeks.forEach(function(week){
			week.days.forEach(function(day, i){
				var scenes = (week.checked ? $scope.currentWeek.days[i] : day).scenes;
				scenes && scenes.forEach(function(scene){
					data.push({
						teaching_time: day.start,
						pool_id: $scope.class.id,
						mode_id: scene.mode,
						start_at: scene.start - 1,
						end_at: scene.end - 1
					})
				});
			})
		});
		scheduler.save({
				timezone_offset: new Date().getTimezoneOffset(),
				pool_id: $scope.class.id,
				data: data
			},
			function(res){
				fn_get_scheduler(_scope.class);
				$scope.disableEditMode();
		});
	};
	var _scope = $scope;
	$scope.clearAll = function(){
		var dialog = $modal.open({
			template: '<div class="padding-10">\
				<div class="modal-header">\
					<button type="button" class="close" data-ng-click="close()"><span aria-hidden="true">×</span></button>\
					<h4 class="modal-title" data-localize="清除课程表"></h4>\
				</div>\
				<form name="schedulerForm">\
					<div class="padding-10" data-localize="DELETE_SCHEDULE"></div>\
					<div style="text-align:right">\
						<button class="btn btn-primary" ng-click="ok()" data-localize="确定"></button>\
						<button class="btn btn-default" ng-click="close()" data-localize="取消"></button>\
					</div>\
				</form>\
			</div>',
			size: "sm",
			background: "static",
			controller: function($scope, $modalInstance){
				$scope.ok = function(){
					scheduler.save({
						pool_id: _scope.class.id,
						data: []
					}, function(res){
						$modalInstance.close();
						fn_get_scheduler(_scope.class);
					});
				};
				$scope.close = function(){
					$modalInstance.close();
				};
			}
		});
	};

	$scope.setting = function(){
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/scheduler/config.html",
			size: "md",
			backdrop: "static",
			controller: function($scope, $modalInstance){
				console.log($scope, this);
				$scope.start_time = _scope.start_time || new Date();
				$scope.end_time = _scope.end_time || new Date();
				$scope.classHours = angular.copy(_scope.classHours);

				$scope.startDateOptions = {
					formatYear: 'yy',
					startingDay: 1
				};
				$scope.endDateOptions = {
					formatYear: 'yy',
					startingDay: 1
				};
				//$scope.startDateOpened = true;

				$scope.minEndTime = function(){
					if($scope.start_time){
						return $scope.start_time.getTime() + num_day * 60;
					}
				};

				$scope.maxEndTime = function(){
					if($scope.start_time)
						return $scope.start_time.getTime() + num_day * 180;
				};

				$scope.openStartDate = function($event){
					$event.preventDefault();
					$event.stopPropagation();
					$scope.endDateOpened = false;
					$scope.startDateOpened = true;
					//this.$$childTail.$$prevSibling.isOpen = true;
				};
				$scope.openEndDate = function($event){
					$event.preventDefault();
					$event.stopPropagation();
					$scope.startDateOpened = false;
					$scope.endDateOpened = true;
					//this.$$childTail.isOpen = true;
				};
				$scope.startTimeChange = function(){
					if($scope.start_time > $scope.end_time){
						$scope.end_time = $scope.start_time;
					}
				};
				// $scope.changeStartHours = function(hour){
				// 	if(hour.start >= hour.end){
				// 		hour.start = new Date(hour.end.getTime());
				// 	}
				// };
				// $scope.changeEndHours = function(hour){
				// 	if(hour.end <= hour.start){
				// 		hour.end = new Date(hour.start.getTime());
				// 	}
				// };

				$scope.formValid = function(){
					var time_wrong = false;
					$scope.classHours.map(function(hour){
						if( hour.start>=hour.end || hour.end<= hour.start){
							time_wrong = true;
						}
					})
					return $scope.$$childTail.schedulerForm.$valid && !time_wrong;
				};
				$scope.$on('matchInput', function(e,v){
					$scope.matchInput = v;
				})
				$scope.ok = function(){
					var data = {
						semester_start: $scope.start_time.getTime(),
						semester_end: $scope.end_time.getTime(),
						period: $scope.classHours.map(function(hour){
							return hour.start.getHours() + ":" + hour.start.getMinutes() + "-" +
								hour.end.getHours() + ":" + hour.end.getMinutes();
						}).join(",")
					};
					scheduler.updateConfig(data, function(res){
						fn_update_config(res.result);
						$modalInstance.close();
					});
				};
				$scope.close = function(){
					$modalInstance.close();
				};
			}
		});
	};
}])
