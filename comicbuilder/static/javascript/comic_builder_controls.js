/* Debug */
function debug(s){
	if(navigator.appName == 'Netscape')
		console.debug(s);
	else
		alert(s);
}

var main_form = $('comic_builder_controls');

function getNumericId(element){
	return element.id.split('_').last();
}
/*****************************************/
/********** HELPERS SECTION **************/
/*****************************************/
// A little hack to make draggables show right in a hidden overflow container.
// Otherwise, their z-index gets under the rest of the document, and the
// dragging element doesn't show
_overflow_onStart = function(draggable){
	var r = draggable.element.replace($('placeholder'));
	$$('body').first().insert(r);
	draggable.handle = r;
}
_overflow_onEnd = function(draggable){
	var r = draggable.handle;
	r.remove();
	var p = $('placeholder').replace(r);
	$$('body').first().insert(p);
}

// Added styles to be compatible with standard browsers
function _setOpacity(element, opacity){
	element.style.opacity = opacity;
	element.style.filter = "alpha:opacity(" + opacity + ")";
	element.style.KHTMLOpacity = opacity;
	element.style.MozOpacity = opacity;
}
/*******************************************/
/********** CHARACTER SECTION **************/
/*******************************************/
// Make new characters that may have been updated from server draggable
var storeScroll = 0;
function make_characters_draggable(){
	$$('.character').each(function(element){
		new Draggable(element,
			{
				ghosting: true,
				revert: true,
				onStart: _overflow_onStart,
				onEnd: _overflow_onEnd
			}
		)
	})
}

// Ajax requesting the character pictures for a given character profile.
function show_characters_for(id){
	new Ajax.Updater(
		"characters",
		"/characters/" + id + "/",
		{ onComplete: make_characters_draggable }
);}

// Make characters droppable
for(var i = 1; i <= 3; i++){
	['left', 'right'].each(function(d){
		Droppables.add(
			'comic_box_' + i + '_' + d + '_char',
			{
				accept: 'character',
				hoverclass: 'comic_box_character_hover',
				onDrop: function(draggable, droppable) {
					main_form[
						'character_' + droppable.readAttribute('box') + '_' + droppable.readAttribute('place')
					].setValue(getNumericId(draggable));
					Draggables.endDrag();
					droppable.setStyle(
						{background:"transparent url(" + draggable.src + ") no-repeat bottom " + d}
					);
				}
			}
		)
	})
}

// Tooltips and hover events on character boxes
for(var i = 1; i <= 3; i++){
	['left', 'right'].each( function(e){
		var character = 'comic_box_' + i + '_' + e + '_char';
		new Tooltip(character, 'tooltip_character_drag_box');
	})
}

/*************************************************/
/********** NUMBER OF BOXES SECTION **************/
/*************************************************/
new Form.Element.EventObserver(
	'num_boxes', 
	function(element) {
		var n = parseInt(element.getValue());
		for(var i = 1; i <= 3; i++){
			if(i <= n){
				$('comic_box_' + i).show();
			}else{
				$('comic_box_' + i).hide();
			}
		}
	}
)

/*********************************************/
/********** BACKGROUNDS SECTION **************/
/*********************************************/


// Makes background images draggable, and their Droppable correspondant elements.
$$('img.background').each( function(element){
	new Draggable(element,
		{
			ghosting:true,
			revert:true,
			onStart: _overflow_onStart,
			onEnd: _overflow_onEnd
		}
	);
});

for(var i = 1; i <= 3; i++){
	Droppables.add(
		'comic_box_' + i + '_contents',
		{
			accept: 'background',
			hoverclass: 'comic_box_background_hover',
			onDrop: function(draggable, droppable) {
				main_form['background_' + droppable.readAttribute('box')].setValue(getNumericId(draggable));
				Draggables.endDrag();
				droppable.setStyle(
					{background:"#FFFFFF url(" + draggable.src + ") no-repeat"}
				);
			}
		}
	);
}

for(var i = 1; i <= 3; i++){
	new Tooltip('comic_box_' + i + '_contents', 'tooltip_background_drag_box')
}


/**************************************************************/
/********** NARRATION AND DIALOGUE INPUT SECTION **************/
/**************************************************************/

function setDialogueOpacity(e){
	if(e && e.innerHTML.blank()){
		if(e.className == 'comic_box_dialogue_tr') {
			e = e.parentNode.parentNode;
		}
		_setOpacity(e, "0.2");
	}
}

function checkKeyPressed(e){
	if(Event.KEY_ESC == e.keyCode || Event.KEY_RETURN == e.keyCode)
		leaveEditMode();
}

var editing_element = null;

function leaveEditMode() {
	if(editing_element == null)
		return;
	var updater_element = $(editing_element.id + '_updater');
	var contents = updater_element.getValue();
	editing_element.hide();
	updater_element.replace(editing_element);
	editing_element.update(contents);
	
	setDialogueOpacity(editing_element);
	if(editing_element.className == 'comic_box_dialogue_tr'){
		editing_element.show();
		editing_element = editing_element.parentNode.parentNode;
		editing_element.hide();
	}
	Effect.Appear(editing_element);
	editing_element = null;
}

function enterEditMode(e) {
	$('tooltip_edit_box').hide();
	leaveEditMode();

	var element = e.element();
	editing_element = element;

	var new_element = $(element.replace(
		'<textarea id="' + element.id + '_updater" class="' + element.className + '"  ' +
			'rows="' + element.readAttribute("whenEditing") + '>' +
		'</textarea>'
	).id + '_updater');
	new_element.setValue(element.innerHTML.strip());
	new_element.focus();

	Event.observe(new_element, 'keyup', checkKeyPressed);
	Event.observe(new_element, 'change', leaveEditMode);
}

Event.observe('comic_title', 'click', enterEditMode);
new Tooltip('comic_title', 'tooltip_edit_box');
for(var i = 1; i <= 3; i++){
	Event.observe('comic_box_narration_' + i, 'click', enterEditMode);
	new Tooltip('comic_box_narration_' + i, 'tooltip_edit_box');
	['left', 'right'].each(function(e){
		Event.observe('comic_box_dialogue_' + e + i, 'click', enterEditMode);
		new Tooltip('comic_box_dialogue_' + e + i + '_wrapper', 'tooltip_edit_box');
	});
}

/*******************************************/
/********** SCROLLERS SECTION **************/
/*******************************************/

var char_scrolling = false;
var char_scroll_direction = 1;
var char_scroll;

function scrollCharacters() {
	clearTimeout(char_scroll);
	if(!char_scrolling){
		return;
	}
	$('characters').scrollTop += char_scroll_direction * 5;
	char_scroll = setTimeout(scrollCharacters, 40);
}
function stopCharacterScrolling(){
	char_scrolling = false;
}

Event.observe('characters_scroll_down', 'mouseover',
	function(){char_scroll_direction = 1; char_scrolling = true; scrollCharacters()}
)
Event.observe('characters_scroll_down', 'mouseout', stopCharacterScrolling)
Event.observe('characters_scroll_down', 'click',
	function(){$('characters').scrollTop += 100}
)
Event.observe('characters_scroll_up', 'mouseover',
	function(){char_scroll_direction = -1; char_scrolling = true; scrollCharacters()}
)
Event.observe('characters_scroll_up', 'mouseout', stopCharacterScrolling)
Event.observe('characters_scroll_up', 'click',
	function(){$('characters').scrollTop -= 100}
)

// BG

var bg_scrolling = false;
var bg_scroll_direction = 1;
var bg_scroll;

function scrollBackgrounds() {
	clearTimeout(bg_scroll);
	if(!bg_scrolling){
		return;
	}
	$('backgrounds').scrollTop += bg_scroll_direction * 5;
	bg_scroll = setTimeout(scrollBackgrounds, 40);
}
function stopBackgroundScrolling(){
	bg_scrolling = false;
}

Event.observe('backgrounds_scroll_down', 'mouseover',
	function(){bg_scroll_direction = 1; bg_scrolling = true; scrollBackgrounds()}
)
Event.observe('backgrounds_scroll_down', 'mouseout', stopBackgroundScrolling)
Event.observe('backgrounds_scroll_down', 'click',
	function(){$('backgrounds').scrollTop += 100}
)
Event.observe('backgrounds_scroll_up', 'mouseover',
	function(){bg_scroll_direction = -1; bg_scrolling = true; scrollBackgrounds()}
)
Event.observe('backgrounds_scroll_up', 'mouseout', stopBackgroundScrolling)
Event.observe('backgrounds_scroll_up', 'click',
	function(){$('backgrounds').scrollTop -= 100}
)

var displaying = 'char';
var title_bar_show = {background:"transparent url(/imgs/title_bar_show.gif) no-repeat top left"};
var title_bar_hide = {background:"transparent url(/imgs/title_bar_hide.gif) no-repeat top left"};
Event.observe('character_toolbar_title', 'click',
	function(){ 
		if(displaying == 'none'){
			Effect.SlideDown('character_scroll_box');
			$('character_toolbar_title').setStyle(title_bar_show);
			displaying = 'char';
		}else if(displaying == 'bg'){
			Effect.SlideUp('background_scroll_box');
			$('background_toolbar_title').setStyle(title_bar_hide);
			Effect.SlideDown('character_scroll_box');
			$('character_toolbar_title').setStyle(title_bar_show);
			displaying = 'char';
		}else if(displaying == 'char'){
			Effect.SlideUp('character_scroll_box');
			$('character_toolbar_title').setStyle(title_bar_hide);
			displaying = 'none';
		}		
	}
)
Event.observe('background_toolbar_title', 'click',
	function(){ 
		if(displaying == 'none'){
			$('background_toolbar_title').setStyle(title_bar_show);
			Effect.SlideDown('background_scroll_box');
			displaying = 'bg';
		}else if(displaying == 'char'){
			$('character_toolbar_title').setStyle(title_bar_hide);
			Effect.SlideUp('character_scroll_box');
			$('background_toolbar_title').setStyle(title_bar_show);
			Effect.SlideDown('background_scroll_box');
			displaying = 'bg';
		}else if(displaying == 'bg'){
			$('background_toolbar_title').setStyle(title_bar_hide);
			Effect.SlideUp('background_scroll_box');
			displaying = 'none';
		}		
	}
)

/****************************************/
/********** SUBMIT SECTION **************/
/****************************************/

function submit_comic() {
	main_form['title'].setValue($('comic_title').innerHTML.strip() || "Untitled");
	for(var i = 1; i <= 3; i++){
		main_form['narration_' + i].setValue($('comic_box_narration_' + i).innerHTML.strip());
		['left', 'right'].each(function(place){
			main_form['dialogue_' + i + '_' + place].setValue(
				$('comic_box_dialogue_' + place + i).innerHTML.strip()
			);
		});
	}
	main_form.submit();
}

/// TODOS
/* 
 * Call automatically characters
 * Backgrounds in categories
 * Option to remove character from box
 */