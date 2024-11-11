function tableauValeurUnique(array) {
  let seenValues = new Set();
  const uniqueArray = array.filter((item) => {
    if (!seenValues.has(item.valueID)) {
      seenValues.add(item.valueID);
      return true;
    }
    return false;
  });
  return uniqueArray;
}

function reformatterValeursEquipe(arrayTeam, teamNumber) {
  return arrayTeam.filter((item) => item.value && item.value != '').map((item) => ({valueID: item.value, team: teamNumber}));
}

export {
  tableauValeurUnique,
  reformatterValeursEquipe,
};
