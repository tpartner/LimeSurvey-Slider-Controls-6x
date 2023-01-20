
/***** 
    JavaScript for the Slider-With-Controls question theme
    Copyright (C) 2022 - Tony Partner (http://partnersurveys.com)
    Licensed MIT, GPL
    Version - 1.0
    Create date - 11/05/2022
*****/

// Disable console.trace 
console.trace = function() {};

function initSliderControls(sqID, scrolling, scrollInterval, valuePrefix, valueSuffix) {
	
	var thisInput = $('input[name="'+sqID+'"]');
	var thisQuestion = $(thisInput).closest('.numeric-multi');
	var thisRow = $(thisInput).closest('li.question-item');
	var thisSGQ = sqID.replace('slid', '');
	
	var thisSliderStep = Number($(thisInput).attr('data-cs-step'));
	var thisSliderMin = Number($(thisInput).attr('data-cs-min'));
	var thisSliderMax = Number($(thisInput).attr('data-cs-max'));
	var csSeparator = $(thisInput).attr('data-cs-separator');
		
	$(thisQuestion).addClass('control-slider-question');
	
	// Initial states
	csHandleButtonState(thisInput, thisRow, thisSliderMin, thisSliderMax);	
	csUpdateTooltip(thisInput, thisRow, valuePrefix, valueSuffix);

	// Initiate listener on slider
	csSliderListener(thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax);
			
	// Initiate listener on the control buttons
	csButtonListener(thisSGQ, thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax, thisSliderStep, csSeparator);
			
	// Initiate scrolling
	if(scrolling == true && scrollInterval > 0) {
		csHandleScrolling(thisSGQ, thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax, thisSliderStep, csSeparator, scrollInterval);
	}
			
	// Initiate listener on reset button
	csHandleReset(thisInput, thisRow, thisSliderMin, thisSliderMax);
	
	// Fix resizing bug in Bootstrap sliders
	$(window).on('resize', function(e) {
		setTimeout(function() {
			csUpdateTooltip(thisInput, thisRow, valuePrefix, valueSuffix);
		}, 10);
	});
}
	
// Function to update the slider tooltip
function csUpdateTooltip(thisInput, thisRow, valuePrefix, valueSuffix) {
	if($.trim($(thisInput).val()) != '') {
		$('.tooltip-inner', thisRow).text(valuePrefix+$(thisInput).val()+valueSuffix);
		$('.tooltip.in', thisRow).show();
	}
}
	
// Listener on slider
function csSliderListener(thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax) {
	$(thisInput).on('slide slideStop', function(e) {
		csHandleButtonState(this, thisRow, thisSliderMin, thisSliderMax);
		csUpdateTooltip(thisInput, thisRow, valuePrefix, valueSuffix);
	});
		
	// Listener on the slider track
	$('.slider', thisRow).on('mousedown touchstart', function(e) {
		csUpdateTooltip(thisInput, thisRow, valuePrefix, valueSuffix);
	});
}
	
// Listener on the buttons
function csButtonListener(thisSGQ, thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax, thisSliderStep, csSeparator) {
	$('button.slider-button', thisRow).on('click touchend', function(e) {
		csHandleButtons(thisSGQ, this, thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax, thisSliderStep, csSeparator)	;		
		csHandleButtonState($(thisInput), thisRow, thisSliderMin, thisSliderMax);
	});
}
			
// Function to handle button states
function csHandleButtonState(slider, thisRow, thisSliderMin, thisSliderMax) {
	var thisSliderVal = $(slider).val();
	$('button.slider-button', thisRow).prop('disabled', false);
	if (thisSliderVal == thisSliderMin) {
		$('button.slider-button.down', thisRow).prop('disabled', true);
	}
	if (thisSliderVal == thisSliderMax) {
		$('button.slider-button.up', thisRow).prop('disabled', true);
	}
}
			
// Function to handle button actions
function csHandleButtons(thisSGQ, thisButton, thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax, thisSliderStep, csSeparator) {
	var stepDecimals = 0;
	if(thisSliderStep.toString().indexOf('.') >= 0) {
		stepDecimals = thisSliderStep.toString().split('.')[1].length;
	}
	var thisSliderVal = Number(String($(thisInput).val()).replace(csSeparator, '.')).toFixed(stepDecimals);
	
	if ($(thisButton).hasClass('down') && Number(thisSliderVal) > thisSliderMin) {
		var newValue = Number(thisSliderVal)-thisSliderStep;
		window.activeSliders['s'+thisSGQ].getSlider().setValue(newValue);
		// Re-initiate listener on slider (seems to get unbound when manipulating the slider)
		csSliderListener(thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax);
	}
	if ($(thisButton).hasClass('up') && Number(thisSliderVal) < thisSliderMax) {
		var newValue = Number(thisSliderVal)+thisSliderStep;
		window.activeSliders['s'+thisSGQ].getSlider().setValue(newValue);
		// Re-initiate listener on slider
		csSliderListener(thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax);
	}
	
	var newValue2 = String($(thisInput).val()).replace(/\./, csSeparator);
	$('input:text', thisRow).val(newValue2).trigger('change');
	
	csUpdateTooltip(thisInput, thisRow, valuePrefix, valueSuffix);
	
	if($.trim($(thisInput).val()) != '') {
		$('.slider', thisRow).removeClass('slider-untouched').addClass('slider-touched');
	}
}

// Function to handle scrolling
function csHandleScrolling(thisSGQ, thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax, thisSliderStep, csSeparator, scrollInterval) {
		var sliderTimeout;
		var count = 0;

		$('button.slider-button', thisRow).on('mousedown touchstart', function(){
			var thisButton = $(this);
			sliderTimeout = setInterval(function(){
				if(thisButton.is(":hover")) {
					csHandleButtons(thisSGQ, thisButton, thisInput, thisRow, valuePrefix, valueSuffix, thisSliderMin, thisSliderMax, thisSliderStep, csSeparator);
				}
				else {
					clearInterval(sliderTimeout);
					csHandleButtonState($(thisInput), thisRow, thisSliderMin, thisSliderMax);
				}
			}, scrollInterval);				
			return false;
		});				
		
		$('button.slider-button', thisRow).on('mouseup touchend blur', function(){
			clearInterval(sliderTimeout);
			return false;
		});			
}

// Function to handle the reset button
function csHandleReset(thisInput, thisRow, thisSliderMin, thisSliderMax) {
	$('.btn-slider-reset', thisRow).on( "click", function( event, ui ) {
		var thisReset = $(this);
		setTimeout(function() {
			if($('input:text:eq(0)', thisRow).val() == '') {
				// Fix LS bug
				$('input:text:eq(0)', thisRow).val($('input:text:eq(1)', thisRow).val())
			}
			csHandleButtonState($(thisInput), thisRow, thisSliderMin, thisSliderMax);
		}, 150);
	});	
}

