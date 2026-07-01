"use client";

// RHF
import { useFormContext } from "react-hook-form";

// Components
import { FormInput, Subheading } from "@/app/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Contexts
import { useTranslationContext } from "@/contexts/TranslationContext";

// Types
import { InvoiceType } from "@/types";

const PaymentInformation = () => {
    const { _t } = useTranslationContext();
    const { watch, setValue } = useFormContext<InvoiceType>();

    const paymentType =
        watch("details.paymentInformation.paymentType") ?? "bank";

    return (
        <section>
            <Subheading>{_t("form.steps.paymentInfo.heading")}:</Subheading>

            <Tabs
                value={paymentType}
                onValueChange={(value) =>
                    setValue(
                        "details.paymentInformation.paymentType",
                        value as "bank" | "crypto"
                    )
                }
                className="mt-5"
            >
                <TabsList>
                    <TabsTrigger value="bank">
                        {_t("form.steps.paymentInfo.bank")}
                    </TabsTrigger>
                    <TabsTrigger value="crypto">
                        {_t("form.steps.paymentInfo.crypto")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="bank">
                    <div className="flex flex-wrap gap-10 mt-5">
                        <FormInput
                            name="details.paymentInformation.bankName"
                            label={_t("form.steps.paymentInfo.bankName")}
                            placeholder={_t("form.steps.paymentInfo.bankName")}
                            vertical
                        />
                        <FormInput
                            name="details.paymentInformation.accountName"
                            label={_t("form.steps.paymentInfo.accountName")}
                            placeholder={_t(
                                "form.steps.paymentInfo.accountName"
                            )}
                            vertical
                        />
                        <FormInput
                            name="details.paymentInformation.accountNumber"
                            label={_t("form.steps.paymentInfo.accountNumber")}
                            placeholder={_t(
                                "form.steps.paymentInfo.accountNumber"
                            )}
                            vertical
                        />
                    </div>
                </TabsContent>

                <TabsContent value="crypto">
                    <div className="flex flex-wrap gap-10 mt-5">
                        <FormInput
                            name="details.paymentInformation.network"
                            label={_t("form.steps.paymentInfo.network")}
                            placeholder={_t("form.steps.paymentInfo.network")}
                            vertical
                        />
                        <FormInput
                            name="details.paymentInformation.walletAddress"
                            label={_t("form.steps.paymentInfo.walletAddress")}
                            placeholder={_t(
                                "form.steps.paymentInfo.walletAddress"
                            )}
                            vertical
                        />
                        <FormInput
                            name="details.paymentInformation.asset"
                            label={_t("form.steps.paymentInfo.asset")}
                            placeholder={_t("form.steps.paymentInfo.asset")}
                            vertical
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
};

export default PaymentInformation;
