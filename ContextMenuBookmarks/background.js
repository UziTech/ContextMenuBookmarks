// Traverse the bookmark tree, and print the folder and nodes.
chrome.refreshingBookmarks = false;
function refreshContextBookmarks(id, info) {
	if (!chrome.refreshingBookmarks) {
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
		chrome.contextMenus.create({
			"title": "Manage Bookmarks",
			"id": "manage",
			"parentId": parent,
			"contexts": ["all"],
			"onclick": function (info, tab) {
				openBookmark(info, tab, "chrome://bookmarks");
			}
		});
		chrome.contextMenus.create({
			"title": "Refresh",
			"id": "refresh",
			"parentId": parent,
			"contexts": ["all"],
			"onclick": function (info, tab) {
				refreshContextBookmarks("refresh", info);
			}
		});
	});
}

function contextNode(bookmarkNode, parent) {
	if (bookmarkNode.children && bookmarkNode.children.length > 0) {
		var folder = parent;
		if (bookmarkNode.title) {
			folder = chrome.contextMenus.create({
				"title": bookmarkNode.title,
				"id": bookmarkNode.id,
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
				"id": bookmarkNode.id,
				"parentId": parent,
				"onclick": function (info, tab) {
					openBookmark(info, tab, url);
				},
				"contexts": ["all"]
			});
		} else {
			var code = url.substring(11);
			chrome.contextMenus.create({
				"title": "JS: " + bookmarkNode.title,
				"id": bookmarkNode.id,
				"parentId": parent,
				"onclick": function (info, tab) {
					executeBookmarklet(info, tab, code);
				},
				"contexts": ["all"]
			});
		}
	}
}

function executeBookmarklet(info, tab, code) {
	if (tab.url.indexOf("chrome://") === 0) {
		alert("Cannot execute script on 'chrome://' pages.");
	} else {
		chrome.tabs.executeScript({
			code: code
		});
	}
}

function openBookmark(info, tab, url) {
	chrome.tabs.create({"url": url});
}

contextBookmarks();
chrome.bookmarks.onChanged.addListener(refreshContextBookmarks);
chrome.bookmarks.onRemoved.addListener(refreshContextBookmarks);
chrome.bookmarks.onCreated.addListener(refreshContextBookmarks);
chrome.bookmarks.onMoved.addListener(refreshContextBookmarks);
chrome.bookmarks.onChildrenReordered.addListener(refreshContextBookmarks);
