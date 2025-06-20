export function formatMonthFull(date: Date): string {
	const months = {
		0: "January",
		1: "February",
		2: "March",
		3: "April",
		4: "May",
		5: "June",
		6: "July",
		7: "August",
		8: "September",
		9: "October",
		10: "November",
		11: "December",
	};

	const day = date.getDate().toString().padStart(2, "0");
	const month = months[date.getMonth() as keyof typeof months];
	const year = date.getFullYear();

	return `${day} ${month} ${year}`;
}
