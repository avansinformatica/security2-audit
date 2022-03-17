export function relationAllowed(relationType: string, startType: string, endType: string): boolean {
  if (relationType == "ConsistsOf") {
    return startType == "Program" && (endType == "Unit" || endType == "Degree");
  } else if (relationType == "Yields") {
    return startType == "Unit" && endType == "Result";
  } else if (relationType == "UsedIn") {
    return startType == "Result" && (endType == "Unit" || endType == "Degree");
  } else {
    return false;
  }
}