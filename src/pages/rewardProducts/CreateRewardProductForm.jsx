import CreateProductForm from "../../components/CreateProductForm/CreateProductForm";

function CreateRewardProductForm({ isSubmitting, onSubmit }) {
  return (
    <CreateProductForm
      hideCatalogFields
      isRewardProduct
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      submitLabel="Create Reward Product"
    />
  );
}

export default CreateRewardProductForm;
