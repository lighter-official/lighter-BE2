export function makeCronExpression(uctDate: Date) {
  const [hour, minute] = [uctDate.getHours(), uctDate.getMinutes()];
  const cronExpression = `0 ${minute} ${hour} * * * * *`;

  return cronExpression;
}
