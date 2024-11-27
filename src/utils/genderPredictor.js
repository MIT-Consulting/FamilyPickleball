// Common male and female first names
export const maleNames = new Set([
  'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph', 'thomas', 'charles',
  'christopher', 'daniel', 'matthew', 'anthony', 'donald', 'mark', 'paul', 'steven', 'andrew', 'kenneth',
  'george', 'joshua', 'kevin', 'brian', 'edward', 'ronald', 'timothy', 'jason', 'jeffrey', 'ryan',
  'jacob', 'gary', 'nicholas', 'eric', 'stephen', 'jonathan', 'larry', 'justin', 'scott', 'brandon',
  'frank', 'benjamin', 'gregory', 'samuel', 'raymond', 'patrick', 'alexander', 'jack', 'dennis', 'jerry',
  // Additional male names
  'dave', 'evan', 'steve', 'wayne', 'jon', 'jonathan', 'ben', 'jeremiah', 'jeffery', 'jeffrey',
  'jeff', 'braydon', 'bray', 'luke', 'uncle wayne', 'uncle mark', 'uncle david', 'uncle jonathan'
]);

export const femaleNames = new Set([
  'mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica', 'sarah', 'karen',
  'nancy', 'margaret', 'lisa', 'betty', 'dorothy', 'sandra', 'ashley', 'kimberly', 'donna', 'emily',
  'michelle', 'carol', 'amanda', 'melissa', 'deborah', 'stephanie', 'rebecca', 'laura', 'sharon', 'cynthia',
  'kathleen', 'amy', 'angela', 'shirley', 'anna', 'ruth', 'brenda', 'pamela', 'nicole', 'katherine',
  'samantha', 'christine', 'catherine', 'virginia', 'debra', 'rachel', 'janet', 'emma', 'carolyn', 'maria',
  // Additional female names
  'jennie', 'chloe', 'hannah', 'bonanza', 'gramma', 'linda', 'betsy', 'aunt betsy', 'aunt erin',
  'aunt jennie', 'aly', 'alyson', 'emmaleigh', 'emmie', 'emmy', 'anneliese', 'clara'
]);

export const predictGender = (name) => {
  // Convert to lowercase and check for exact match first (for names with prefixes like 'uncle', 'aunt')
  const exactMatch = name.trim().toLowerCase();
  if (maleNames.has(exactMatch) || femaleNames.has(exactMatch)) {
    return maleNames.has(exactMatch) ? 'male' : 'female';
  }

  // If no exact match, try first name only
  const firstName = exactMatch.split(' ')[0];
  if (maleNames.has(firstName)) {
    return 'male';
  } else if (femaleNames.has(firstName)) {
    return 'female';
  }
  
  return 'unknown';
}; 