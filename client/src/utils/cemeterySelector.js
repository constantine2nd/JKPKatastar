
const getSelectedCemetery = () => {
    let selectedCemetery = null;
    if (localStorage.getItem("selected-cemetery") !== null) {
        selectedCemetery = JSON.parse(localStorage.getItem("selected-cemetery") || "{}");
    }
    return selectedCemetery;
};

export { getSelectedCemetery };