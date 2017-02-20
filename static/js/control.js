var nameInput = document.getElementById("nameInput");
var searchInput = document.getElementById("searchInput");
var itemDeclarationBody = document.getElementById("itemDeclarationBody");
var itemInstanceBody = document.getElementById("itemInstanceBody");

function AuctionItem(name, search, tr) {
    this.name = name;
    this.search = search;
    this.tr = tr;
}

function AuctionItemInstance(name, search, time) {
    this.name = name;
    this.search = search;
    this.time = time;
    this.notification = false;
}

var items = {};

function IsRealValue(obj)
{
    return obj && obj !== 'null' && obj !== 'undefined';
}

function MsToTime(t) {
    var seconds = parseInt((t/1000)%60)
    var minutes = parseInt(t/(1000*60))
    
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return minutes + ":" + seconds;
}

function AddItem() {
    var name = nameInput.value;
    var search = searchInput.value;
    if (IsRealValue(items[name])) {
        items[name].searchPattern = search;
        
        var itemSearch = items[name].tr.getElementsByClassName("itemSearch");
        itemSearch[0].innerHTML = search;

        // find all existing items
        var currentItems = document.getElementsByClassName("itemInstance");
        for (var index = 0 ; index < currentItems.length ; index++) {
            var itemName = currentItems[index].getElementsByClassName("itemName");
            if(itemName[0].innerHTML == name) {
                var itemSearch = currentItems[index].getElementsByClassName("itemSearch");
                itemSearch[0].innerHTML = search;
                break;
            }
        }
    } else {
        var tr = itemDeclarationBody.appendChild(document.createElement("tr"));
        
        var nameTd = tr.appendChild(document.createElement("td"));
        nameTd.innerHTML = name;
        nameTd.className = "itemName";
        
        var searchTd = tr.appendChild(document.createElement("td"));
        searchTd.innerHTML = search
        searchTd.className = "itemSearch";
        
        var actionTd = tr.appendChild(document.createElement("td"));
        
        var newButton = actionTd.appendChild(document.createElement("button"));
        newButton.innerHTML = "New";
        newButton.className = "newButton";
        newButton.onclick = function() {
            NewInstance(name);
        };
        
        var deleteButton = actionTd.appendChild(document.createElement("button"));
        deleteButton.innerHTML = "Delete";
        deleteButton.className = "deleteButton";
        deleteButton.onclick = function () {
            DeleteItem(name);
        };

        
        items[name] = new AuctionItem(name, search, tr);
    }
}

function NewInstance(itemName) {
    var tr = itemInstanceBody.appendChild(document.createElement("tr"));
    tr.className = "itemInstance";
    tr.data = new AuctionItemInstance(items[itemName].name, items[itemName].search, Date.now());
    
    var nameTd = tr.appendChild(document.createElement("td"));
    nameTd.innerHTML = tr.data.name;
    nameTd.className = "itemName";
   
   var searchTd = tr.appendChild(document.createElement("td"));
   searchTd.innerHTML = tr.data.search;
   searchTd.className = "itemSearch";
   
   var statusTd = tr.appendChild(document.createElement("td"));
   statusTd.className = "itemStatus";
   
   RefreshItemInformation();
}

function DeleteItem(itemName) {
    
}

function Notify(itemInstance) {
    var notification = new Notification('BDO Bid Helper', {
        icon: "static/image/Gmark.PNG",
        body: itemInstance.name + " 這不是來了嗎.",
    });

    notification.onclick = function () {
      parent.focus();
      window.focus(); //just in case, older browsers
      this.close();
    };
    
    var audio = new Audio("static/sound/bell.mp3");
    audio.play();
}

function RefreshItemInformation() {
    var nowTime = Date.now();
    var trs = itemInstanceBody.getElementsByTagName("tr");
    for(var i = 0 ; i < trs.length ; i++) {
        var status = trs[i].getElementsByClassName("itemStatus");
        var delta = nowTime - trs[i].data.time;
        if (delta >= 900000) {
            // over 15 minutes, remove the instance
            trs[i].parentNode.removeChild(trs[i]);
            i--;
        } else if (delta < 900000 && delta >= 600000) {
            status[0].innerHTML = "-" + MsToTime(delta - 600000);
            status[0].style.fontWeight = "900";
            status[0].style.color = "red";
        } else if (delta < 600000 && delta >= 540000) {
            status[0].innerHTML = MsToTime(600000 - delta);
            status[0].style.color = "orange";
            
            if(trs[i].data.notification == false) {
                Notify(trs[i].data);
                trs[i].data.notification = true;
            }
        } else if (delta < 540000) {
            status[0].innerHTML = MsToTime(600000 - delta);
        }
    }
}

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

var t=setInterval(RefreshItemInformation,1000);