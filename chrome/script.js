$(document).ready(function() {
	console.log("is this working? ");
	var a = $("html");
	console.log(a);
	chrome.storage.sync.get({
        favoriteColor: 'red',
        likesColor: true
    }, function(items) {
        console.log(items.favoriteColor);
        console.log(items.likesColor);
    });
});
