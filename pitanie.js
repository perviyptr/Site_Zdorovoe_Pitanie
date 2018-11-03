"use strict";

function randomNumber() {
	return Math.round(Math.random() * 100);
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomColor() {
	return (
		"rgb(" +
		randomInt(0, 255) +
		", " +
		randomInt(0, 255) +
		", " +
		randomInt(0, 255) +
		")"
	);
}

// const pereyti_vverh = document.getElementById("pereyti_vverh");
// pereyti_vverh.addEventListener("click", vverh);

// function vverh() {
// 	window.scrollTo(0, 0);
// }

// function vniz() {
// 	window.scrollTo(0, document.body.scrollHeight);
// }

const ctx = document.getElementById("canvas").getContext("2d");

var select = document.getElementById("usda");

for (var key in productsRus) {
	var option = document.createElement("option");
	option.setAttribute("value", key);
	option.textContent = productsRus[key];
	select.appendChild(option);
}

let chart;

select.addEventListener("change", event => {
	const mass = prompt("Масса, граммов", 100);

	if (mass == null) {
		return;
	}

	const номерПродукта = event.detail.value;
	chart.data.datasets.push(рассчитатьПродукт(номерПродукта, mass));
	chart.update();
	save();
	// vniz();
});

const индексыНутриентов = {};

for (let i = 0; i < products.nutrients.length; i++) {
	индексыНутриентов[products.nutrients[i]] = i;
}

const normKeys = Object.keys(norms);

function рассчитатьПродукт(
	номерПродукта,
	mass,
	backgroundColor = randomColor()
) {
	if (typeof mass === 'string') {
		mass = Number(mass.replace(',', '.'));
	}

	const полнаяПищеваяЦенность = products.products[номерПродукта] || дополнительныеПродукты[номерПродукта];

	if (!полнаяПищеваяЦенность) {
		alert("Ошибка: отсутствуют данные о продукте");
		return;
	}
	const пищеваяЦенность = normKeys.map(
		код => полнаяПищеваяЦенность[индексыНутриентов[код]] || 0
	);

	return {
		label: productsRus[номерПродукта] + ", " + mass + " г.",
		backgroundColor,
		data: пищеваяЦенность.map(
			(value, i) =>
				Math.round(value / 100 * mass / norms[normKeys[i]] * 1000) / 10
		),
		номерПродукта,
		mass
	};
}

const barChartData = {
	labels: normKeys.map(код => kodNutrients[код]),
	datasets: [],
};

const choices = new Choices(select, {
	searchResultLimit: 20,
	fuseOptions: {
		threshold: 0,
		tokenize: true
	}
});

const defaultLegendClickHandler = Chart.defaults.global.legend.onClick;

Chart.defaults.global.defaultFontColor = "#000";

chart = new Chart(ctx, {
	type: "horizontalBar",
	data: barChartData,
	options: {
		title: {
			fontSize: 18,
			display: true,
			text:
				"Химический состав и калорийность рациона в процентах от суточной потребности"
		},
		responsive: true,
		scales: {
			yAxes: [
				{
					stacked: true
					// ticks: { minRotation: 90 }
				}
			],
			xAxes: [
				{
					stacked: true,
					ticks: { max: 200 }
				}
			]
		},
		annotation: {
			annotations: [
				{
					type: "line",
					mode: "vertical",
					scaleID: "x-axis-0",
					value: 100,
					borderColor: "rgb(50, 200, 50)",
					borderWidth: 2
				}
			]
		},
		tooltips: {
			mode: "nearest"
		},
		legend: {
			onClick(event, item) {
				if (event.ctrlKey && event.shiftKey) {
					const {
						номерПродукта,
						mass,
						backgroundColor
					} = this.chart.data.datasets[item.datasetIndex];
					const newMass = prompt("Масса, граммов", mass);

					if (newMass == null) {
						return;
					}

					this.chart.data.datasets.splice(
						item.datasetIndex,
						1,
						рассчитатьПродукт(
							номерПродукта,
							newMass,
							backgroundColor
						)
					);
					this.chart.update();
					save();
				} else if (event.shiftKey) {
					for (let i = 0; i < this.chart.data.datasets.length; i++) {
						const product = this.chart.data.datasets[i];
						product._meta[0].hidden = i !== item.datasetIndex;
					}

					this.chart.update();
				} else if (event.ctrlKey) {
					this.chart.data.datasets.splice(item.datasetIndex, 1);
					this.chart.update();
					save();
				} else if (event.altKey) {
					this.chart.data.datasets[
						item.datasetIndex
					].backgroundColor = randomColor();
					this.chart.update();
					save();
				} else {
					defaultLegendClickHandler.call(this, event, item);
				}
			}
		}
		// animation: {
		// 	duration: 0,
		// },
	}
});




let блокДляВставкиТаблицы;
let таблица1;
let таблица2;
let заголовок;
select.addEventListener("change", СоздатьТаблицу);
 function СоздатьТаблицу(){
	var таблицаДляУдаления = document.querySelectorAll('.table');
	for(var i = 0; i < таблицаДляУдаления.length; i++){
		if(таблицаДляУдаления){
			таблицаДляУдаления[i].remove();
		}
	}	

	блокДляВставкиТаблицы = document.getElementById('дляТаблицы');
	таблица1 = document.createElement('table');
	таблица2 = document.createElement('table');	
	блокДляВставкиТаблицы.appendChild(таблица1);
	блокДляВставкиТаблицы.appendChild(таблица2);
	
	for (var key in products.nutrients){
	var кодНутриента = document.createElement('p');
	кодНутриента.textContent = products.nutrients[key];
	таблица1.appendChild(кодНутриента);	
	
	for(var key in kodNutrients){
	var наименованиеНутриента = document.createElement('p');
	наименованиеНутриента.textContent = kodNutrients[key];
		if(кодНутриента.textContent == key){
			кодНутриента.remove();
			таблица1.appendChild(наименованиеНутриента);
			}
			if(кодНутриента.textContent == '221' || кодНутриента.textContent == '257' || кодНутриента.textContent == '263' || кодНутриента.textContent == '324' || кодНутриента.textContent == '325' || кодНутриента.textContent == '326' || кодНутриента.textContent == '334' || кодНутриента.textContent == '337' || кодНутриента.textContent == '338' || кодНутриента.textContent == '341' || кодНутриента.textContent == '342' || кодНутриента.textContent == '343' || кодНутриента.textContent == '344' || кодНутриента.textContent == '345' || кодНутриента.textContent == '346' || кодНутриента.textContent == '347' || кодНутриента.textContent == '417' || кодНутриента.textContent == '428' || кодНутриента.textContent == '429' || кодНутриента.textContent == '431' || кодНутриента.textContent == '432' || кодНутриента.textContent == '454' || кодНутриента.textContent == '573' || кодНутриента.textContent == '578' || кодНутриента.textContent == '605' || кодНутриента.textContent == '607' || кодНутриента.textContent == '608' || кодНутриента.textContent == '609' || кодНутриента.textContent == '610' || кодНутриента.textContent == '611' || кодНутриента.textContent == '612' || кодНутриента.textContent == '613' || кодНутриента.textContent == '614' || кодНутриента.textContent == '615' || кодНутриента.textContent == '617' || кодНутриента.textContent == '618' || кодНутриента.textContent == '619' || кодНутриента.textContent == '620' || кодНутриента.textContent == '621' || кодНутриента.textContent == '624' || кодНутриента.textContent == '625' || кодНутриента.textContent == '626' || кодНутриента.textContent == '627' || кодНутриента.textContent == '628' || кодНутриента.textContent == '629' || кодНутриента.textContent == '630' || кодНутриента.textContent == '631' || кодНутриента.textContent == '636' || кодНутриента.textContent == '638' || кодНутриента.textContent == '639' || кодНутриента.textContent == '641' || кодНутриента.textContent == '652' || кодНутриента.textContent == '653' || кодНутриента.textContent == '654' || кодНутриента.textContent == '662' || кодНутриента.textContent == '663' || кодНутриента.textContent == '664' || кодНутриента.textContent == '665' || кодНутриента.textContent == '666' || кодНутриента.textContent == '669' || кодНутриента.textContent == '670' || кодНутриента.textContent == '671' || кодНутриента.textContent == '672' || кодНутриента.textContent == '673' || кодНутриента.textContent == '674' || кодНутриента.textContent == '675' || кодНутриента.textContent == '676' || кодНутриента.textContent == '685' || кодНутриента.textContent == '687' || кодНутриента.textContent == '689' || кодНутриента.textContent == '693' || кодНутриента.textContent == '695' || кодНутриента.textContent == '696' || кодНутриента.textContent == '697' || кодНутриента.textContent == '851' || кодНутриента.textContent == '852' || кодНутриента.textContent == '853' || кодНутриента.textContent == '855' || кодНутриента.textContent == '856' || кодНутриента.textContent == '857' || кодНутриента.textContent == '858' || кодНутриента.textContent == '859'){
				кодНутриента.textContent = '—';
			}
		}		
	}
	for (var key in products.products[select.value]){
	var содержаниеВеществВнутриентах = document.createElement('p');
		if(products.products[select.value][key] == null || products.products[select.value][key] == 0){
			содержаниеВеществВнутриентах.textContent = '—';
		}else{
			содержаниеВеществВнутриентах.textContent = products.products[select.value][key];
		}
	таблица2.appendChild(содержаниеВеществВнутриентах);
	заголовок = document.getElementById('заголовокДляСостава');
	}

	for (var key in дополнительныеПродукты[select.value]){
	var содержаниеВеществВнутриентах = document.createElement('p');
		if(дополнительныеПродукты[select.value][key] == null || дополнительныеПродукты[select.value][key] == 0){
			содержаниеВеществВнутриентах.textContent = '—';
		}else{
			содержаниеВеществВнутриентах.textContent = дополнительныеПродукты[select.value][key];
		}
	таблица2.appendChild(содержаниеВеществВнутриентах);
	}
	заголовок = document.getElementById('заголовокДляСостава');
	заголовок.textContent = productsRus[select.value] + ' (Содержание химических элементов в 100г)' + "—" + '(Удаление по щелчку)'; 
	заголовок.classList.remove("скрытый");	
	таблица1.classList.add("table");
	таблица2.classList.add("table");

	заголовок.addEventListener('click', СкрытьТаблицу);
	function СкрытьТаблицу(){
		заголовок.classList.add("скрытый");	
		таблица1.classList.add("скрытый");
		таблица2.classList.add("скрытый");
	}

}



document.getElementById('resetGraphHidden').addEventListener('click', resetGraphHidden);

function resetGraphHidden() {
	for (let i = 0; i < chart.data.datasets.length; i++) {
		const product = chart.data.datasets[i];
		product._meta[0].hidden = false;
	}

	chart.update();
}

const form = document.getElementById("form");

form.addEventListener("submit", event => {
	event.preventDefault();
	выполнитьРасчёт();
	пересчитатьГрафик();
	save();
});

const user = document.getElementById("user");
const addUser = document.getElementById("addUser");
const МужскойПол = document.getElementById("perekluchatel_mujskoy");
const ЖенскийПол = document.getElementById("perekluchatel_jenskiy");
const Возраст = document.getElementById("dla_vvoda_vozrasta");
const Рост = document.getElementById("dla_vvoda_rosta");
const Вес = document.getElementById("dla_vvoda_vesa");
const Труд = document.getElementById("группаТруда");
const Цель = document.getElementById("цель");
const Калорийность = document.getElementById("kaloriynost");
const Белки = document.getElementById("belki");
const Жиры = document.getElementById("jiri");
const Углеводы = document.getElementById("uglevodi");
const Вода = document.getElementById("voda");

function getData() {
	return localStorage.data
		? JSON.parse(localStorage.data)
		: {users: {}};
}

user.addEventListener("change", () => {
	load(user.value);
	save();
});

addUser.addEventListener("click", () => {
	const name = prompt("Введите имя нового пользователя");

	if (name == null) {
		return;
	}

	const data = getData();

	if (name in data.users) {
		alert("Такой пользователь уже существует")
		return;
	}

	const option = document.createElement('option');
	option.value = name;
	option.textContent = name;
	user.appendChild(option);
	form.reset();
	chart.data.datasets = [];
	user.value = name;
	save();
	chart.update();
});

function save() {
	const data = getData();
	data.user = user.value;

	data.users[data.user] = {
		МужскойПол: МужскойПол.checked,
		ЖенскийПол: ЖенскийПол.checked,
		Возраст: Возраст.value,
		Рост: Рост.value,
		Вес: Вес.value,
		Труд: Труд.value,
		Цель: Цель.value,
		Калорийность: Калорийность.value,
		Белки: Белки.value,
		Жиры: Жиры.value,
		Углеводы: Углеводы.value,
		Вода: Вода.value,
		chart: chart.data.datasets.map(({ backgroundColor, mass, номерПродукта }) => ({
			backgroundColor,
			mass,
			номерПродукта
		})),
	};

	localStorage.data = JSON.stringify(data);
}

function load(loadUser = null) {
	if (!localStorage.data) {
		return;
	}

	const data = getData();
	user.innerHTML = '';

	for (const userName in data.users) {
		const option = document.createElement('option');
		option.value = userName;
		option.textContent = userName;
		user.appendChild(option);
	}

	user.value = loadUser || data.user;
	const userData = data.users[user.value];

	МужскойПол.checked = userData.МужскойПол;
	ЖенскийПол.checked = userData.ЖенскийПол;
	Возраст.value = userData.Возраст;
	Рост.value = userData.Рост;
	Вес.value = userData.Вес;
	Труд.value = userData.Труд;
	Цель.value = userData.Цель;
	Калорийность.value = userData.Калорийность;
	Белки.value = userData.Белки;
	Жиры.value = userData.Жиры;
	Углеводы.value = userData.Углеводы;
	Вода.value = userData.Вода;
	chart.data.datasets = userData.chart;
	пересчитатьГрафик();
	chart.update();
}

const коэффициентАктивности = {
	неработающие: 1.2,
	умственный: 1.375,
	легкийФизический: 1.55 ,
	среднийФизический: 1.725 ,
	тяжелыйФизиский: 1.9,
	особоТяжелыйФизиский: 2,
};

const коээфициентыПоЦелям = {
	сбалансированноеПитание: 1,
	плавноеПохудение: 0.9,
	активноеПохудение: 0.8,
	быстроеПохудение: 0.7,
};

function пересчитатьБелкиЖирыУглеводы() {
	const калорийность = Number(Калорийность.value);
	const белки = Math.round((калорийность * 0.2) / 4);
	const жиры = Math.round((калорийность * 0.35) / 9);
	const углеводы = Math.round((калорийность * 0.45) / 4);
	Белки.value = белки;
	Жиры.value = жиры;
	Углеводы.value = углеводы;
}

function пересчитатьКалории() {
	const белки = Number(Белки.value);
	const жиры = Number(Жиры.value);
	const углеводы = Number(Углеводы.value);
	const калорийность = Math.round(белки * 4 + жиры * 9 + углеводы * 4);
	Калорийность.value = калорийность;
}

function пересчитатьГрафик() {
	norms['208'] = Number(Калорийность.value) || 2000;
	norms['203'] = Number(Белки.value) || 100;
	norms['204'] = Number(Жиры.value) || 80;
	norms['205'] = Number(Углеводы.value) || 230;	
	norms['255'] = Number(Вода.value) || 3200;

	chart.data.datasets = chart.data.datasets.map(
		({номерПродукта, mass, backgroundColor}) => рассчитатьПродукт(номерПродукта, mass, backgroundColor)
	);

	chart.update();
}

function пересчитатьВоду() {
	var вес = Number(Вес.value);
	const вода = Math.round(вес * 40);
	Вода.value = вода;
}

function выполнитьРасчёт() {
	const рост = Number(Рост.value);
	const возраст = Number(Возраст.value);
	var вес = Number(Вес.value);
	const калорииПоПолу = МужскойПол.checked ? 5 : -161;
	const основнойОбмен = 10 * вес + 6.25 * рост - 5 * возраст + калорииПоПолу;
	const калорийность = Math.round(основнойОбмен * коэффициентАктивности[Труд.value] * коээфициентыПоЦелям[Цель.value]);
	Калорийность.value = калорийность;
	пересчитатьБелкиЖирыУглеводы();
	пересчитатьВоду();
}

Калорийность.addEventListener('change', () => {
	пересчитатьБелкиЖирыУглеводы();
	пересчитатьГрафик();
	save();
});

function приИзмененииНорм() {
	пересчитатьКалории();
	пересчитатьГрафик();
	save();
}

Вес.addEventListener('change', () => {
	пересчитатьВоду();
	пересчитатьГрафик();
	save();
});

Белки.addEventListener('change', приИзмененииНорм);
Жиры.addEventListener('change', приИзмененииНорм);
Углеводы.addEventListener('change', приИзмененииНорм);

Вода.addEventListener('change', () => {
	пересчитатьГрафик();
	save();
});

load();
