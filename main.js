//create rows x colls game field
function createField(rows,colls,$field)
{
	//clear field
	$field.empty()

	for (let i = 0;i < rows;i++)
	{
		//create row
		const $row = $('<div>').addClass('row');

		//adds columns to row
		for (let j = 0;j < colls;j++)
		{
			const $coll = $('<div>').addClass('coll hidden').attr('row',i).attr('coll',j);
			$row.append($coll);
		}


		//adds row to game field
		$field.append($row);
	}
}

//fill game field by mines
function mineField($field,rows,colls,cell_row,cell_coll)
{
	//go through field
	for (let i = 0;i < rows;i++)
	{
		for (let j = 0;j < colls;j++)
		{
			//if current cell does not equals selected by player cell and random number less than 0.1 - mines cell
			if (Math.random() < 0.2 && i != cell_row && j != cell_coll)
			{
				let $cell = $('.coll[row=' + i + '][coll=' +  j + ']')
				$cell.addClass('mine')
				amountFlags++
			}	
		}
	}

	reveal(cell_row,cell_coll)
}

//check if player won or lost
function gameOver(game_result,rows,colls,$field)
{
	let message = null;

	if (game_result)
	{
		message = 'You won'
	}
	else
	{
		message = 'You lost'

		//delete flags on mined cells 
		$('.coll.mine.flag').empty()
		//add bomb to mined cells
		$('.coll.mine').append($('<i>').addClass('fa fa-bomb'))
	}

	setTimeout(function() {
		
		//display message
		alert(message)

		//create new field
		createField(rows,colls,$field)

		//reset amount of flags
		amountUserFlags = 0
		amountFlags = 0

		createLabelFlags()

		//set try is first 
		firstTry = true
	},1000)



}

//reveal cells
function reveal(row,coll)
{
	let $cell = $('.coll[row=' + row + '][coll=' +  coll + ']')

	if ($cell.hasClass('mine') || row < 0 || coll < 0 || row > rows || coll > colls || !$cell.hasClass('hidden'))
	{
		return;
	}

 	$cell.removeClass('hidden')

 	const amount_mine = countMine(row,coll)

 	if (amount_mine > 0)
 	{
		$cell.text(amount_mine)
 	}



	for (let i = -1;i <= 1;i++)
	{
		for (let j = -1;j <= 1;j++)
		{
			const y = i + row;
			const x = j + coll;

			const $neighbour= $('.coll[row=' + y + '][coll=' +  x + ']');


			if ($neighbour.hasClass('mine'))
			{
				return
			}
		}
	}

	for (let i = -1;i <= 1;i++)
	{
		for (let j = -1;j <= 1;j++)
		{
			const y = i + row;
			const x = j + coll;

			reveal(y,x)
		}
	}
}

//count how much mines around cell
function countMine(row,coll)
{
	let count = 0

	for (let i = -1;i <= 1;i++)
	{
		for (let j = -1;j <= 1;j++)
		{
			const y = i + row;
			const x = j + coll;

			if (y < 0 || x < 0 || y > rows || x > colls)
			{
				continue;
			}

			const $neighbour= $('.coll[row=' + y + '][coll=' +  x + ']');

			if ($neighbour.hasClass('mine'))
			{
				count++;
			}
		}
	}

	return count;
}

//create label display how many flags on filds / how many boms on field
function createLabelFlags()
{
	let digits = amountUserFlags.toString().length + amountFlags.toString().length

	let padding = 20 + digits * 10 

	$flagIcon.removeClass('fa fa-flag')
	$flagIcon.empty()

	$flagsCheck.empty()

	$flagsCheck = $('<div>').css('display','inline-block').css('position','absolute').css('padding-left','10px')
	$flagsCheck.append('<i>').html(amountUserFlags + '/' + amountFlags) 

	$flagIcon = $('<div>').css('display','inline-block').css('position','absolute').css('padding-left',padding + 'px').
		css('padding-top','2px')

	$flagIcon.append('<i>').addClass('fa fa-flag')

	$('body').append($flagsCheck)
	$('body').append($flagIcon)

	//disable context menu when use right click 
	$('#field').on("contextmenu",function () {
	   	return false;
	}); 
}

//field size
const rows = 10
const colls = 10

//game field
const $field = $('#field')

//is try first
var firstTry = true

var amountFlags = 0
var amountUserFlags = 0

//create game field 
createField(rows,colls,$field)

var $flagsCheck = $()
var $flagIcon = $()


//event handler when user click on cells
$field.on('mousedown','.coll.hidden', function (event) {

	//selected cell
	const $cell = $(this)

	//position of cell
	const row = parseInt($cell.attr('row'))
	const coll = parseInt($cell.attr('coll'))

	switch(event.which)
	{
		//left cl1ck
		case 1:
		{
			//if it is first try mine field
			if (firstTry)
			{
				mineField($field,rows,colls,row,coll)
				firstTry = false
				createLabelFlags()
			}
			else if ($cell.hasClass('mine') && $cell.is(':empty'))
			{
				gameOver(false,rows,colls,$field)
			}
			else
			{
				reveal(row,coll)
			}

			break
		}

		//right click
		case 3:
		{
			if ($cell.is(':empty') && amountFlags != amountUserFlags)
			{
				$cell.append($('<i>').addClass('fa fa-flag'))
				$cell.addClass('flag')
				amountUserFlags++
			}
			else if ($cell.hasClass('flag'))
			{
				$cell.empty()
				$cell.removeClass('flag')
				amountUserFlags--
			}

			createLabelFlags()

			break
		}

		default:
		{
			break;
		}
	}

	let amount_flags = 0
	let amount_unhidden = 0

	for(let i = 0;i < rows;i++)
	{
		for(let j = 0;j < colls;j++)
		{
			const $cell = $('.coll[row=' + i + '][coll=' +  j + ']');

			if ($cell.hasClass('flag'))
			{
				amount_flags++
			}

			if (!$cell.hasClass('hidden'))
			{
				amount_unhidden++
			}
		}
	}

	const isGameOver = (amount_unhidden + amount_flags) == $('.coll').length

	if (isGameOver)
	{
		gameOver(true,rows,colls,$field)
	}

});

