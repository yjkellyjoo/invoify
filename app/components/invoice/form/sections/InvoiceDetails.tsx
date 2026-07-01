"use client";

import { useEffect } from "react";

// RHF
import { useFormContext, useWatch } from "react-hook-form";

// Components
import {
    CurrencySelector,
    DatePickerFormField,
    FormInput,
    FormFile,
    Subheading,
    TemplateSelector,
} from "@/app/components";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

const InvoiceDetails = () => {
    const { _t } = useTranslationContext();

    // Untyped like DatePickerFormField: the schema transforms dates to strings
    // at validation time, but the form holds Date objects at runtime.
    const { control, setValue } = useFormContext();

    const invoiceDate = useWatch({ name: "details.invoiceDate", control });
    const dueDate = useWatch({ name: "details.dueDate", control });

    // Auto-fill the due date to invoice date + 30 days, but only when the user
    // has not set a due date yet (non-destructive to manual edits).
    useEffect(() => {
        if (invoiceDate && !dueDate) {
            const due = new Date(invoiceDate);
            due.setDate(due.getDate() + 30);
            setValue("details.dueDate", due);
        }
    }, [invoiceDate, dueDate, setValue]);

    return (
        <section className="flex flex-col flex-wrap gap-5">
            <Subheading>{_t("form.steps.invoiceDetails.heading")}:</Subheading>

            <div className="flex flex-row flex-wrap gap-5">
                <div className="flex flex-col gap-2">
                    <FormFile
                        name="details.invoiceLogo"
                        label={_t(
                            "form.steps.invoiceDetails.invoiceLogo.label"
                        )}
                        placeholder={_t(
                            "form.steps.invoiceDetails.invoiceLogo.placeholder"
                        )}
                    />

                    <FormInput
                        name="details.invoiceNumber"
                        label={_t("form.steps.invoiceDetails.invoiceNumber")}
                        placeholder="Invoice number"
                    />

                    <DatePickerFormField
                        name="details.invoiceDate"
                        label={_t("form.steps.invoiceDetails.issuedDate")}
                    />

                    <DatePickerFormField
                        name="details.dueDate"
                        label={_t("form.steps.invoiceDetails.dueDate")}
                    />

                    <CurrencySelector
                        name="details.currency"
                        label={_t("form.steps.invoiceDetails.currency")}
                        placeholder="Select Currency"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <TemplateSelector />
                </div>
            </div>
        </section>
    );
};

export default InvoiceDetails;
