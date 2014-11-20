// Traverse the bookmark tree, and print the folder and nodes.
function refreshContextBookmarks(id, info) {
	chrome.contextMenus.removeAll();
	contextBookmarks();
}

function contextBookmarks() {
	chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
		var parent = chrome.contextMenus.create({
			"title": "Bookmarks",
			"id": "1",
			"contexts": ["all"]
		});
		for (var i = 0; i < bookmarkTreeNodes.length; i++) {
			contextNode(bookmarkTreeNodes[i], parent);
		}
		chrome.contextMenus.create({
			"type": "separator",
			"parentId": parent,
			"contexts": ["all"]
		});
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
		if (bookmarkNode.title && bookmarkNode.id !== "1") {
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
		chrome.contextMenus.create({
			"type": "separator",
			"parentId": folder,
			"contexts": ["link"]
		});
		chrome.contextMenus.create({
			"title": "Add Bookmark",
			"id": folder + "ADD",
			"parentId": folder,
			"onclick": function (info, tab) {
				addBookmark(info, tab);
			},
			"contexts": ["link"]
		});
		if (bookmarkNode.id === "1") {
			chrome.contextMenus.create({
				"type": "separator",
				"parentId": folder,
				"contexts": ["all"]
			});
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
				"title": bookmarkNode.title,
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

function addBookmark(info, tab) {
	var title = prompt("Bookmark Name:", info.linkUrl);
	chrome.bookmarks.create({
		"parentId": info.parentMenuItemId,
		"title": title ? title : info.linkUrl,
		"url": info.linkUrl
	});
}

contextBookmarks();
chrome.bookmarks.onChanged.addListener(refreshContextBookmarks);
chrome.bookmarks.onRemoved.addListener(refreshContextBookmarks);
chrome.bookmarks.onCreated.addListener(refreshContextBookmarks);
chrome.bookmarks.onMoved.addListener(refreshContextBookmarks);
chrome.bookmarks.onChildrenReordered.addListener(refreshContextBookmarks);
