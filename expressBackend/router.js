
/*module.exports = router;*/
const express = require('express');
const componentController = require('./controller');





const router = express.Router();

router.get('/components', componentController.getComponents);
router.post('/addcomponent', componentController.addComponent);
router.put('/updatecomponent', componentController.updateComponent);
router.delete('/deletecomponent', componentController.deleteComponent);
// Add to router.js
router.get('/getComponentStates', componentController.getComponentStates);



module.exports = router;