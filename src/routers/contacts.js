import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { updateContactSchema, createContactSchema } from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';


import {
  getContactsController,
  getContactByIdController,
  createContactController,
  patchContactController,
  deleteContactController,
} from '../controllers/contacts.js';
const router = Router();

router.use('/:contactId', isValidId);
router.get('/', ctrlWrapper (getContactsController));
router.get('/:contactId', ctrlWrapper(getContactByIdController));
router.post('', validateBody(createContactSchema), ctrlWrapper(createContactController));
router.patch('/:contactId', validateBody(updateContactSchema),ctrlWrapper(patchContactController));
router.delete('/:contactId', ctrlWrapper(deleteContactController));

export default router;
