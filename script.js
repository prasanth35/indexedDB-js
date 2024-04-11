// Check for indexedDb
const indexedDb = window.indexedDB || 
window.mozIndexedDB ||
 window.mozIndexedDB || 
 window.msIndexedDB ||
 window.shimIndexedDB

 let displayResults = document.querySelector('#displayResults') 
// If no indexedDB found throw error
 if(!indexedDb){
    alert('No indexedDb is found in this browser')
    console.error('No indexedDb is found in this browser')
 }

// Make connection to indexedDb
// 1st parameter -> name of the database , 2nd parameter version of the database
const request = indexedDb.open('CarsDatabase',1)

// Error event
request.onerror = function(event) {
    console.error("Error occurred with indexedDb",event)
    alert("Error occurred with indexedDb , check console")
}

// Upgrade event
// This event is triggered when a new db is created or version number is incremented
request.onupgradeneeded = function() {
    console.info("Upgrade needed function executed")
    const db = request.result
    //create new table named cars with key as id
    const store = db.createObjectStore("cars",{keyPath : 'id' , autoIncrement : true})
    //  name of the index , [column names] , constraint
    //create indexes for the your table, which will be effective for searching
    store.createIndex("cars_color" ,['color'] , {unique:false})
    //Combined index
    store.createIndex("color_and_make" , ["color","make"],{unique:false})
}


function getData  () {
    const db = request.result
    const transaction = db.transaction("cars",'readonly')
    const store = transaction.objectStore('cars')
    const data = store.getAll()
    data.onsuccess = function () {
        console.log("🚀 ~ getData ~ data:", data.result)
    }

}


function closeDbConnection () {
    request.result.close()
    alert("Connection closed")
}

function insert() {

    const color = document.getElementById('colorInput').value
    const make = document.getElementById('makeInput').value

    const db = request.result
    const transaction = db.transaction('cars','readwrite')
    const store = transaction.objectStore('cars')

    store.put({color,make })
    transaction.oncomplete = function () {
        alert("Data inserted successfully")
        db.close()
    }
}





request.onsuccess = function () {
    console.info("onsuccess method executed")

    const db = request.result

    //create transactions - so that if any write function is made , if it is successfully completed it will be committed to the database , else will be reverted
    const transaction = db.transaction("cars",'readwrite')

    //get tables and indexes
    const store = transaction.objectStore("cars")
    const colorIndex = store.index("cars_color")
    const colorAndMakeIndex = store.index("color_and_make")

    //Insert data into table - use put method
    store.put({ id: 1, color: "Red", make: "Toyota" });
    store.put({ id: 2, color: "Red", make: "Kia" });
    store.put({ id: 3, color: "Blue", make: "Honda" });
    store.put({ id: 4, color: "Silver", make: "Subaru" });
    
    const idQuery = store.get(4)

    idQuery.onsuccess = function(){
        console.log('IdQuery Results',idQuery?.result)
    }

    const colorQuery = colorIndex.getAll(['Red'])
    colorQuery.onsuccess = function() {
        console.log('Color Query Results',colorQuery.result)
    }

    const colorMakeQuery = colorAndMakeIndex.get(['Blue','Honda'])

    colorMakeQuery.onsuccess = function() {
        console.log('Color and Make Query Results',colorMakeQuery.result)
    }

    // transaction.oncomplete = function() {
    //     db.close();
    //      console.info("Db connection closed")
    // }
}
