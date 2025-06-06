const existingRecord = await ControlNumberHistory.findOne({
  where: { monthYear: '2025-06' }
});

if (existingRecord) {
  console.log("Record already exists for '2025-06'. Skipping insert.");
} else {
  // Proceed with insert
  await ControlNumberHistory.create({
    monthYear: '2025-06',
    lastControlNumber: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
