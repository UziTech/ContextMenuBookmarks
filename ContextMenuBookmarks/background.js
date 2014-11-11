// Traverse the bookmark tree, and print the folder and nodes.
chrome.refreshingBookmarks = false;
function refreshContextBookmarks() {
	if(!chrome.refreshingBookmarks){
		chrome.refreshingBookmarks = true;
		chrome.contextMenus.remove("bookmarks");
		contextBookmarks();
		chrome.refreshingBookmarks = false;
	}
}

function contextBookmarks() {
	chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
		var parent = chrome.contextMenus.create({
			"title": "Bookmarks",
			"id": "bookmarks",
			"contexts": ["all"]
		});
		for (var i = 0; i < bookmarkTreeNodes.length; i++) {
			contextNode(bookmarkTreeNodes[i], parent);
		}
	});
}

function contextNode(bookmarkNode, parent) {
	if (bookmarkNode.children && bookmarkNode.children.length > 0) {
		var folder = parent;
		if (bookmarkNode.title) {
			folder = chrome.contextMenus.create({
				"title": bookmarkNode.title,
				"parentId": parent,
				"contexts": ["all"]
			});
		}
		for (var i = 0; i < bookmarkNode.children.length; i++) {
			contextNode(bookmarkNode.children[i], folder);
		}
	} else if (bookmarkNode.title && bookmarkNode.url) {
		var url = bookmarkNode.url;
		if (url.indexOf("javascript:") !== 0) {
			chrome.contextMenus.create({
				"title": bookmarkNode.title,
				"parentId": parent,
				"onclick": function () {
					chrome.tabs.create({"url": url});
				},
				"contexts": ["all"]
			});
		} else {
			var code = url.substring(11);
			chrome.contextMenus.create({
				"title": "JS: " + bookmarkNode.title,
				"parentId": parent,
				"onclick": function () {
					chrome.tabs.executeScript({
						code: code
					});
				},
				"contexts": ["all"]
			});
		}
	}
}

contextBookmarks();
chrome.bookmarks.onChanged.addListener(refreshContextBookmarks);
chrome.bookmarks.onRemoved.addListener(refreshContextBookmarks);
chrome.bookmarks.onCreated.addListener(refreshContextBookmarks);
chrome.bookmarks.onMoved.addListener(refreshContextBookmarks);
chrome.bookmarks.onChildrenReordered.addListener(refreshContextBookmarks);
