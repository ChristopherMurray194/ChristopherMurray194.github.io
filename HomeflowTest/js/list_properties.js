// Receive data from url
//var requestURL = "http://index1.homeflow.co.uk/properties?api_key=" + api_key;
var requestURL = "http://index1.homeflow.co.uk/properties?api_key=";
var dataSectionID = "searchDataSection"; // ID to identify the created section element

/*
	Add the searches to the API URL using data from the form to populate searches.
	URL will only be fetched when form submit button is pressed.
*/
function searchURL()
{
	clearPreviousSearch();

	// Ensure the user gives an API key
	// TODO: Handle incorrect inputs i.e. invalid keys
	if(document.getElementById("apiKey").value == "")
		window.alert("You must give an API Key!");
	else
	{
		// Add searches to URL
		requestURL += document.getElementById("apiKey").value +
					applySearch("channel", document.getElementsByName("channel")) + 
					applySearch("min_price", document.getElementById("min_price").value) + 
					applySearch("max_price", document.getElementById("max_price").value) + 
					applySearch("min_bedrooms", document.getElementById("min_beds").value) + 
					applySearch("max_bedrooms", document.getElementById("max_beds").value);
		
		console.log(requestURL);
	}

	// Request the JSON from the URL via ajax-cross-origin plugin
	$.ajax(
	{
		crossOrigin: true,
		type: "GET",
		url: requestURL,
	}).done(function (dataText)
	{
		// Parse JSON string to Javascript object
		var data = JSON.parse(dataText);
	
		handleData(data);
	});
}

function applySearch(search, searchValue)
{
	// If the search being applied is the channel
	if(search == "channel")
	{
		// Get the selected channel
		for(var i = 0; i < searchValue.length; i++)
		{
			if(searchValue[i].checked)
				searchValue = searchValue[i].value;
		}
	}
	
	// If the passed value is null
	if(searchValue == null)
		return ""; // No search needed
		
	return "&search[" + search + "]=" + searchValue;
}

function clearPreviousSearch()
{
	// If the section already exists
	if(document.getElementById(dataSectionID) != null)
		document.getElementById(dataSectionID).remove(); // Remove it
		
	// Add a section element to wrap the new search data
	createDataSection();
}

/**
* Create a new section element to house the elements that will display the data.
*/
function createDataSection()
{
	var dataSection = document.createElement("section");
	dataSection.setAttribute("id", dataSectionID);
	document.getElementById("main_wrapper").insertBefore(dataSection, document.getElementById("footerSection"));
}

function handleData(data)
{
	// Store the list of properties
	var results = data.result.properties.elements;
	
	// If the search yielded no results
	if(results.length == 0)
	{
		var noResultsMsg = document.createElement("p");
		noResultsMsg.innerHTML = "Sorry no properties found against your search.";
		document.getElementById(dataSectionID).appendChild(noResultsMsg);
	}
	// Display results
	else
	{
		displayPropertyTotal(results);
		displayPropertyList(results);
	}
};

/*
	Display the total number of properties found in a heading
*/
function displayPropertyTotal(elements)
{
	var heading = document.getElementById("housesFound");
	heading.innerHTML = elements.length + " houses found";
}

/*
	Visualise the data for each individual property
*/
function displayPropertyList(elements)
{
	// Create the table to display the properties in
	var propertyTable = document.createElement("div");
	propertyTable.setAttribute("id", "propertyTable");
	propertyTable.setAttribute("class", "table");
	// Append the div to the section
	document.getElementById(dataSectionID).appendChild(propertyTable);
	
	var displayCap = 10;
	var displayCount = 0;
	
	for(var i = 0; i < displayCap; i++)
	{
		displayIndivProperty(elements[i]);
		displayCount++;
	};
	
	//==========ADD 'MORE' BUTTON IF NECESSARY=============
	// If there are more properties to display
	if(elements.length > displayCap)
	{
		// Add a button so the user can choose to display more properties
		var moreBttn = document.createElement("button");
		moreBttn.setAttribute("type", "button");
		moreBttn.setAttribute("id", "moreBttn");
		moreBttn.innerHTML = "More";
		moreBttn.addEventListener("click", function()
		{
			var currentCount = displayCount; // The current number of properties being shown
			
			if(currentCount + displayCap < elements.length)
			{
				for(var i = currentCount; i < currentCount + displayCap; i++)
				{
					displayIndivProperty(elements[i]);
					displayCount++;
				}
			}
			else
			{
				for(var i = currentCount; i < currentCount + (elements.length - currentCount); i++)
				{
					displayIndivProperty(elements[i]);
					displayCount++;
				}
				document.getElementById("moreBttn").remove();
			}
		});
		document.getElementById(dataSectionID).appendChild(moreBttn);
	}
}

/**
* Display information about the property.
* @param {Object} property - the property passed from the elements array.
*/
function displayIndivProperty(property)
{
	//=========CREATE TABLE ELEMENTS============
	// Create a new row for each property
	var tableRow = document.createElement("div");
	tableRow.setAttribute("class", "tableRow");
	document.getElementById("propertyTable").appendChild(tableRow);
	var imageCell  = document.createElement("div");
	imageCell.setAttribute("class", "tableCell imageCell");
	tableRow.appendChild(imageCell);
	// Create a new cell for the property main info
	var infoCell = document.createElement("div");
	infoCell.setAttribute("class", "tableCell infoCell");
	tableRow.appendChild(infoCell);
	// Create a new cell for the price info
	var priceCell = document.createElement("div");
	priceCell.setAttribute("class", "tableCell priceCell");
	tableRow.appendChild(priceCell);
	
	//===========POPULATE IMAGE CELL==============
	displayPropertyImage(imageCell, property);
	
	//=========POPULATE INFORMATION CELL=========
	displayNewInfo(infoCell, property.display_address, "h3", "results", "Address: ");
	displayNewInfo(infoCell, property.bedrooms, "p", "results", "Beds: ");
	//displayNewInfo(infoCell, property.bathrooms, "p", "Bathrooms: ");
	displayNewInfo(infoCell, property.short_description, "p", "results", "Description:\n");
	
	//======POPULATE PRICE CELL================
	displayNewInfo(priceCell, property.price, "h2");
}

function displayPropertyImage(parent, property)
{
	var img = document.createElement("img");
	img.setAttribute("class", "property_img");
	img.setAttribute("src", " ");
	img.setAttribute("alt", property.property_id);
	parent.appendChild(img);
}

/**
* Adds new information to the information cell of the table.
*
* @param {Object} parent - The parent element.
* @param {Object} data - The property information to be displayed.
* @param {string} element - The element to create.
* @param {string} classes - The classes of the element.
* @param {string} str - The string to be prefixed before the data.
*/
function displayNewInfo(parent, data, element, classes, str = "")
{
	var newElement = document.createElement(element);
	
	/* 
		If the property has no data for the passed object 'data',
		convert to empty string as opposed to 'undefined'.
	*/
	if(data == null)
		data = "";
	
	newElement.setAttribute("class", classes);
	newElement.innerHTML = str + data;
	parent.appendChild(newElement);
}