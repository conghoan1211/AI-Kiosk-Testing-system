import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DialogI } from '@/interfaces/common';
import { Button } from '../ui/button';
import { Form, Formik } from 'formik';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { showError } from '@/helpers/toast';

type ButtonVariant = 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';

interface DialogConfirmProps extends DialogI<any> {
  title: React.ReactNode;
  content: React.ReactNode;
  variantYes?: ButtonVariant;
}

const DialogConfirm = (props: DialogConfirmProps) => {
  const { isOpen, toggle, onSubmit, title, content, variantYes } = props;
  const { t } = useTranslation('shared');

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogOverlay className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity">
        <DialogPortal>
          <DialogContent>
            <Formik
              initialValues={{}}
              onSubmit={async (values, formikHelpers) => {
                try {
                  if (onSubmit) {
                    await onSubmit(values, formikHelpers);
                  }
                } catch (error) {
                  showError(error);
                }
              }}
            >
              {({ isSubmitting }) => {
                return (
                  <Fragment>
                    {title && <DialogTitle>{title}</DialogTitle>}
                    {content && <DialogDescription>{content}</DialogDescription>}

                    <Form className="mt-[25px] flex justify-end gap-2">
                      <Button
                        type="submit"
                        isLoading={isSubmitting}
                        variant={variantYes || 'destructive'}
                      >
                        {t('Yes')}
                      </Button>
                      <Button variant="ghost" type="button" onClick={toggle}>
                        {t('Close')}
                      </Button>
                    </Form>
                  </Fragment>
                );
              }}
            </Formik>
          </DialogContent>
        </DialogPortal>
      </DialogOverlay>
    </Dialog>
  );
};

export default DialogConfirm;
