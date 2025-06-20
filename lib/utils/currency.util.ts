export const formatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
});

export const currencyToNumber = (formattedValue: string): number => {
	const cleanValue = formattedValue.replace(/[^\d,]/g, "");
	const numberValue = cleanValue.replace(",", ".");
	return parseInt(numberValue);
};

export const formatCurrency = (value: string): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "USD",
	}).format(Number(value));
};
