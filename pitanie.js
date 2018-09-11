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

document.getElementById('resetGraphHidden').addEventListener('click', resetGraphHidden);

function resetGraphHidden() {
	for (let i = 0; i < chart.data.datasets.length; i++) {
		const product = chart.data.datasets[i];
		product._meta[0].hidden = false;
	}

	chart.update();
}

const form = document.getElementById("form");

form.addEventListener("submit", () => {
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
	norms['208'] = Number(Калорийность.value);
	norms['203'] = Number(Белки.value);
	norms['204'] = Number(Жиры.value);
	norms['205'] = Number(Углеводы.value);	
	norms['255'] = Number(Вода.value);

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
