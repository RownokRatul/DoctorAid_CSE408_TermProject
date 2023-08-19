const prisma = require("./ORM_init");


// async function get_queued_tests() {
//     const queued_tests = await prisma.queued_tests.findMany({
//         select: {
//             prescription_id: true,
//             test_id: true,
//         }
//     });
//     console.log(queued_tests);
//     return queued_tests;
// }

async function get_queued_tests() {
    try {
      const queuedTests = await prisma.queued_tests.findMany({
        select: {
          prescription_id: true,
          test_id: true,
          test: {
            select: {
              test_name: true,
            },
          },
          prescription:{
            select:{
                date: true,
            }
          }
        },
      });
  
      // You can further format the result if needed
    //   const result = queuedTests.map(item => ({
    //     prescription_id: item.prescription_id,
    //     test_id: item.test_id,
    //     test_name: item.test.test_name,
    //   }));
      return queuedTests;
    // return result;
    } catch (error) {
      console.error("Error fetching queued tests:", error);
      throw error; // You can handle the error as needed
    }
  }
  

async function get_test_metadata(test_id) {
    const test_metadata = await prisma.test_metadata.findUnique({
        where: {
            id: test_id,
        },
    });
    console.log(test_metadata);
    return test_metadata;
}
  

async function update_test_result(presc_id, test_id, result) {

}


module.exports = {
    get_queued_tests,
    get_test_metadata,
    update_test_result,
}
