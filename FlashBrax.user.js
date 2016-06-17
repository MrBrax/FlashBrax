// ==UserScript==
// @name        FlashBrax
// @namespace   mrbrax
// @include     https://www.flashback.org/*
// @version     0.01
// @grant       GM_setValue
// @grant 		GM_getValue
// ==/UserScript==

function getSelectValues(select) {
	var result = [];
	var options = select && select.options;
	var opt;

	for (var i=0, iLen=options.length; i<iLen; i++) {
		opt = options[i];

		if (opt.selected) {
			result.push(opt.value || opt.text);
		}
	}
	return result;
}

var default_Forums = {
	11 : "alkohol",
	26 : "juridik",
	27 : "religion",
	34 : "fascism",
	41 : "litteratur",
	54 : "fysik",
	77 : "politik inrikes",
	79 : "matlagning",
	88 : "språk",
	98 : "kändis",
	254 : "pedo",
	122 : "kläder",
	160 : "Tripp- och rusrapporter",
	303 : "utbildning",
	501 : "fotboll skit 2016",
	279 : "relationsakuten",
	271 : "speldagböcker",
	294 : "privatekonomi",
	502 : "fotboll skit 2016 prat",
	176 : "drogodling",
	482 : "pyramidspel",
	452 : "matredskap",
	444 : "friluftsliv",
	301 : "hårvård",
	181 : "relationer",
	177 : "evighetsdiskussioner",
	196 : "psykisk hälsa",
	439 : "olof palme",
	250 : "kriminalhistoria",
	146 : "fotboll",
	109 : "tobak",
	150 : "feminism",
	329 : "cannabiskultur",
	387 : "hårdvara mac",
	184 : "programvara mac",
	226 : "invandring",
	255 : "kläder köpråd",
	221 : "prostitution",
	338 : "politik eu"
};

var default_Users = {
	"lbl" : 93644,
}

var def_Hidden = JSON.parse( GM_getValue("fbrx_hidden", "{ \"forums\":{}, \"users\":{}, \"posts\":[] }") );
var def_Settings = JSON.parse( GM_getValue("fbrx_settings", "[]") );
var def_Forums = JSON.parse( GM_getValue("fbrx_forums", JSON.stringify(default_Forums) ) );
var def_Users = JSON.parse( GM_getValue("fbrx_users", JSON.stringify(default_Users) ) );

def_Hidden.users[93644] = 1;

console.log( typeof def_Hidden.forums, def_Hidden );

if( typeof def_Hidden.forums == "object" ){
	console.log("convert array to object");
	var tmp = {}
	for(i in def_Hidden.forums){
		tmp[ def_Hidden.forums[i] ] = 1;
	}
	def_Hidden.forums = tmp;
}

console.log( typeof def_Hidden.forums, def_Hidden );

var users = document.querySelectorAll(".bigusername");
var forums = document.querySelectorAll(".forum_title");
var forumlist = document.querySelectorAll(".td_forum div a");

var postlist = document.querySelectorAll("#posts div table:first-child");

var url_newpost = "https://www.flashback.org/external.php?type=rss2&lastpost=1";

var style = document.createElement("style");
style.innerHTML = "td.visible-phone { display: table-cell !important; }";
style.innerHTML +=" tr.live td { background-color: #CAECFD !important; }";
style.innerHTML +=" #fbrx_settings { background-color: #eee; position: fixed; left:50px; right:50px; top:30px; border:1px solid #ccc; padding: 10px; }";
style.innerHTML +=" #fbrx_settings h1 { font-size: 20px; margin-bottom:5px; }";
style.innerHTML +=" #fbrx_settings h1 { font-size: 16px; margin-bottom:5px; }";
document.body.appendChild(style);

function showSettings(){

	var settings = document.createElement("div");
	settings.id = "fbrx_settings";

	var title = document.createElement("h1");
	title.innerHTML = "FlashBrax";
	settings.appendChild(title);

	var title_forums = document.createElement("h2");
	title_forums.innerHTML = "Hidden subforums";
	settings.appendChild(title_forums);

	var list_forums = document.createElement("select");
	list_forums.multiple = "multiple";
	list_forums.style.height = "200px";
	for( id in def_Forums ){
		var opt = document.createElement("option");
		opt.value = id;
		opt.innerHTML = def_Forums[id];
		list_forums.appendChild(opt);
	}
	settings.appendChild(list_forums);


	var list_hforums = document.createElement("select");
	list_hforums.multiple = "multiple";
	list_hforums.style.height = "200px";
	for( id in def_Hidden.forums ){
		var opt = document.createElement("option");
		opt.value = def_Hidden.forums[id];
		opt.innerHTML = def_Forums[ opt.value ];
		list_hforums.appendChild(opt);
	}
	settings.appendChild(list_hforums);

	//settings.innerHTML += "<br>";
	settings.appendChild(document.createElement("br"));


	var btn_move_forums = document.createElement("button");
	btn_move_forums.innerHTML = "Change";
	btn_move_forums.onclick = function(){

		var lfrom = list_forums.selectedOptions;
		var lto = list_hforums.selectedOptions;

		for(var i = 0; i < lfrom.length; i++){
			var opt = document.createElement("option");
			opt.value = lfrom[i].value;
			opt.innerHTML = lfrom[i].innerHTML;
			list_hforums.appendChild(opt);
			def_Hidden.forums.push( lfrom[i].value );
		}

		for(var i = 0; i < lto.length; i++){
			list_hforums.removeChild( lto[i] );
			var index = def_Hidden.forums.indexOf( lto[i].value );
			def_Hidden.forums.splice(index, 1);
		}

		GM_setValue("fbrx_hidden", JSON.stringify( def_Hidden ) );

		console.log( def_Hidden );

	}
	settings.appendChild(btn_move_forums);

	settings.appendChild(document.createElement("br"));
	settings.appendChild(document.createElement("br"));

	var btn_close = document.createElement("button");
	btn_close.innerHTML = "Close";
	btn_close.onclick = function(){
		document.getElementById("fbrx_settings").parentNode.removeChild( document.getElementById("fbrx_settings") );
	}
	settings.appendChild(btn_close);

	document.body.appendChild(settings);

}

if(users && users.length > 0){
	for(var i = 0; i < users.length; i++){
		var post = users[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
		if( def_Hidden.users[ users[i].getAttribute("href").replace("/u","") ] ){
			post.parentNode.removeChild(post);
		}
	}
}

if(forums && forums.length > 0){
	for(var i = 0; i < forums.length; i++){
		var post = forums[i].parentNode.parentNode;
		if( def_Hidden.forums[ forums[i].getAttribute("href").replace("/f","") ] ){
			//console.log("Hide forum " + forums[i].innerHTML + " (" + forums[i].getAttribute("href") + ")" );
			post.parentNode.removeChild(post);
		}
	}
}

if(forumlist && forumlist.length > 0){
	for(var i = 0; i < forumlist.length; i++){
		var post = forumlist[i].parentNode.parentNode.parentNode;
		if( def_Hidden.forums[ forumlist[i].getAttribute("href").replace("/f","") ] ){
			//console.log("Hide forum list " + forumlist[i].innerHTML + " (" + forumlist[i].getAttribute("href") + ")" );
			post.parentNode.removeChild(post);
		}
	}
}

if(postlist && postlist.length > 0){
	for(var i = 0; i < postlist.length; i++){
		var user_el = postlist[i].querySelector(".bigusername");
		if(!user_el) continue;
		var user_name = user_el.innerHTML;
		var user_id = parseInt( user_el.getAttribute("href").replace("/u", "") );
		def_Users[ user_name ] = user_id;
	}
	GM_setValue("fbrx_users", JSON.stringify( def_Users ) );
	console.log( def_Users );
}

if( location.href == "https://www.flashback.org/nya-inlagg" ){

	var gotten_posts = {};
	var last_update = Date.now();
	var update_delay = 30;

	var hiddenusers = document.querySelectorAll("td.visible-phone");
	for(var i = 1; i < hiddenusers.length; i++){
		hiddenusers[i].removeChild(hiddenusers[i].firstElementChild); // remove time
		hiddenusers[i].firstElementChild.removeChild( hiddenusers[i].firstElementChild.firstChild ); // remove "av"
		hiddenusers[i].firstElementChild.removeChild( hiddenusers[i].firstElementChild.lastChild ); // remove arrow
	}

	// no post id returned in xml, gotta do some funky id's
	var existing_posts = document.querySelectorAll("table.threadslist tr");
	for(var i = 1; i < existing_posts.length; i++){
		var id = "";
		id += existing_posts[i].querySelector("span.time").innerHTML;
		id += "-" + existing_posts[i].querySelector("td.td_title").id.match(/([0-9]+)/)[1];
		id += "-" + existing_posts[i].querySelector("td.td_last_post div:last-child a").innerHTML;
		gotten_posts[ id ] = true;

		var subforum = existing_posts[i].querySelector("a.forum_title");
		var subforum_id = subforum.getAttribute("href").replace("/f","");
		var subforum_name = subforum.innerHTML;

		if(!def_Forums[subforum_id] || ( def_Forums[subforum_id] && def_Forums[subforum_id] != subforum_name ) ){
			def_Forums[subforum_id] = subforum_name;
			GM_setValue("fbrx_forums", JSON.stringify( def_Forums ) );
		}

		/*
		
		var b = document.createElement("button");
		b.innerHTML = "x";
			b.onclick = function(e){
				return function(){
					def_Hidden.forums.push( subforum_id );
					alert("Hidden " + subforum.innerHTML);
					e.preventDefault();
					return false;
				}
			}
		})(i);
		subforum.appendChild(b);
		*/

	}

	function getNewPosts(){

		var xhr = new XMLHttpRequest();
		xhr.open("GET", url_newpost, true);
		xhr.onreadystatechange = function (){
			if (xhr.readyState==4 && xhr.status==200){
				var xml = xhr.responseText;
				var parser = new DOMParser();
	    		var xmlDoc = parser.parseFromString(xml, "text/xml");
	    		var posts = xmlDoc.querySelectorAll("rss channel item");

	    		var num_active = 0;

	    		for(var i = posts.length - 1; i > 0; i--){
	    			
	    			var t = posts[i].getElementsByTagName("link").item(0).innerHTML.match(/t([0-9]+)n/);
	    			if(!t || !t[1]){ console.error("no thread returned"); continue; }
	    			var thread = t[1];
	    			
	    			var a = posts[i].getElementsByTagName("author").item(0).innerHTML.match(/com \(([A-Za-z0-9\-\.\ ]+)\)/);
	    			if(!a || !a[1]){ console.error("no author returned"); continue; }
	    			var author = a[1];

	    			var date = new Date(posts[i].getElementsByTagName("pubDate").item(0).innerHTML);
	    			var time = ( date.getHours() < 10 ? "0" + date.getHours() : date.getHours() ) + ":" + ( date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() );

	    			var c = posts[i].getElementsByTagName("category").item(0);
	    			var subforum_id = c.getAttribute("domain").match(/\?f=([0-9]+)/)[1];
	    			var subforum_name = c.innerHTML.replace("<![CDATA[", "").replace("]]>", "");

	    			// fill in unknown forum names
	    			if(!def_Forums[subforum_id] || ( def_Forums[subforum_id] && def_Forums[subforum_id] != subforum_name ) ){
	    				def_Forums[subforum_id] = subforum_name;
	    				GM_setValue("fbrx_forums", JSON.stringify( def_Forums ) );
	    			}

	    			if( ( Date.now() - date.getTime() ) < 6000000 ){
	    				num_active++;
	    			}

	    			console.log( "[time]", posts[i].getElementsByTagName("title").item(0).innerHTML, ( Date.now() - date.getTime() ) );

	    			var id = "";
	    			id += time;
	    			id += "-" + thread;
	    			id += "-" + author;

	    			if(gotten_posts[id]){
	    				//console.log("post already exists", id);
	    				continue;
	    			}

	    			gotten_posts[id] = true;

	    			// hide subforum
	    			if( def_Hidden.forums.indexOf( subforum_id ) !== -1 ){
	    				//console.log("subforum is hidden", subforum_id, subforum_name);
	    				continue;
	    			}

	    			var user_id = def_Users[ author ];

	    			if( user_id && def_Hidden.users[ user_id ] ){
	    				console.log("user is hidden", author, user_id);
	    				continue;
	    			}

	    			var newpost = document.createElement("tr");
	    			newpost.className = "live";

	    			var td_time = document.createElement("td");
	    			td_time.innerHTML = time + ":" + ( date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds() );
	    			td_time.className = "alt1 georgia alignc";
	    			td_time.style.fontSize = "120%";

	    			var td_title = document.createElement("td");
	    			td_title.innerHTML = '<a href="/t' + thread + '">' + posts[i].getElementsByTagName("title").item(0).innerHTML + '</a>';
	    			td_title.className = "alt1 td_title";
	    			td_title.id = "td_title_" + thread;

	    			td_title.innerHTML += ' <a class="gentle2 forum_title" href="/f' + subforum_id + '">' + subforum_name + '</a>';

	    			td_title.innerHTML += ' &nbsp;<a href="/t' + thread + 's" class="thread-goto-lastpost"><img class="inlineimg" src="https://static.flashback.org/img/buttons-new/lastpost.gif" width="9" height="9" alt="" /></a>';

	    			var td_author = document.createElement("td");
	    			td_author.className = "alt1 td_last_post";
	    			td_author.innerHTML = author ? '<a href="/t' + thread + 'lp">' + author + '</a>' : "???";
	    			td_author.innerHTML += '&nbsp; <a href="/t' + thread + 's" class="thread-goto-lastpost"><img class="inlineimg" src="https://static.flashback.org/img/buttons-new/lastpost.gif" width="9" height="9" alt="" /></a>';

	    			newpost.appendChild(td_time);
	    			newpost.appendChild(td_title);

	    			newpost.appendChild(td_author);

	    			// thread stats, who cares
	    			for(var j = 0; j < 3; j++){
		    			var td_null = document.createElement("td");
		    			td_null.className = "alt1 alignc";
		    			td_null.innerHTML = "???";
		    			newpost.appendChild(td_null);
	    			}

	    			var threadlist = document.querySelector("table.threadslist tbody");
	    			//threadlist.appendChild(newpost);
	    			threadlist.insertBefore(newpost, threadlist.firstChild.nextSibling.nextSibling);

	    		}

	    		console.log("posts in 10 minutes", num_active, posts.length);

	    		last_update = Date.now();

	    		setTimeout(getNewPosts, update_delay * 1000);
			}
		};
		xhr.send();

	}

	var info = document.createElement("div");
	info.style.padding = "5px";
	info.style.background = "#eee";

	var info_settings = document.createElement("button");
	info_settings.innerHTML = "Settings";
	info_settings.onclick = showSettings;
	info.appendChild(info_settings);

	var info_timer = document.createElement("span");
	info_timer.id = "fbrx_timer";
	info.appendChild(info_timer);

	document.getElementById("site-main").insertBefore( info, document.getElementById("site-main").firstChild );

	function timerTick(){
		if( Date.now() - last_update > (update_delay * 1000) ){
			document.getElementById("fbrx_timer").innerHTML = "Uppdaterar...";
		}else{
			document.getElementById("fbrx_timer").innerHTML = "Uppdatera om " + ( update_delay - Math.round( ( Date.now() - last_update ) / 1000 ) );
		}
		setTimeout(timerTick, 1000);
	}

	timerTick();
	//getNewPosts();
	setTimeout(getNewPosts, update_delay * 1000);

}