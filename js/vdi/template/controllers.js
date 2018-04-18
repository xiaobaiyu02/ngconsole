angular.module("vdi.template", [])

/* 模板 */
.factory("registerTemplate", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "get", url: $Domain + "/thor/image/register" },
		update:
			{ method: "POST", url: $Domain + "/thor/image/register" }
	});
}])
.factory("Network", ["$resource", "$Domain", function($resource, $Domain){
	return $resource($Domain + "/thor/networks", null, {
		query:
			{ method: "GET", isArray: false, params: null},
		add:
			{ method: "POST", isArray: false},
		get:
			{ method: "GET", url:$Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false},
		alter:
			{ method: "PUT", url:$Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false},
		delete:
			{ method: "DELETE", url:$Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false},

		query_sub:
			{ method: "GET", url:$Domain + "/thor/network/:id/subnets", params: { id: "@id" }},
		add_sub:
			{ method: "POST", url:$Domain + "/thor/network/:id/subnets", params: { id: "@id" }},

		get_sub:
			{ method: "GET", url:$Domain + "/thor/network/subnet/:id", params: { id: "@id" }},
		alter_sub:
			{ method: "PUT", url:$Domain + "/thor/network/subnet/:id", params: { id: "@id" }},
		delete_sub:
			{ method: "DELETE", url:$Domain + "/thor/network/subnet/:id", params: { id: "@id" }},
		ports:
			{ method: "GET", url:$Domain + "/thor/network/subnet/:id/ports", params: { id: "@id" }}

	});
}])

.factory('ResourcePool', ["$resource", "$Domain", function($resource,$Domain){
	return $resource($Domain + "/thor/resource", null, {
		query:
			{ method: "GET"}
	});
}])
/* 模板镜像分发 */
.factory("manageTemplate", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/image/manage/:id", params: { id: "@id" } },
		handout:
			{ method: "POST", url: $Domain + "/thor/image/manage/:id", params: { id: "@id" } },
		delete:
			{ method: "DELETE", url: $Domain + "/thor/image/manage/:id", params: { id: "@id" } }
	});
}])
/* 根据虚拟化类型返回可用主机列表 */
.factory("virtualHost", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/hosts_with_virtual_type", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/hosts_with_virtual_type" }
	});
}])
/* 根据主机查找可用网络 */
.factory("networkWithHost", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/list_network_with_host", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/list_network_with_host" }
	});
}])

.factory("checkIP", ["$resource", "$Domain", function(res, $Domain){
	return res($Domain + "/thor/check_ip", null, {
		check:
			{ method: "GET" }
	});
}])


