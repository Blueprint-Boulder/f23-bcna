from api_callers import *

try:

    new_category_id = create_category("Amphibians with brain parasites")

    new_field_id = create_field("Habitat", "TEXT", [new_category_id])

    new_wildlife_id = create_wildlife("Boov", "Litoria caerulea", new_category_id, {"Habitat": "rainforest"})
    print(f"Wildlife created successfully with ID: {new_wildlife_id}")

    edit_wildlife_id = edit_wildlife(new_wildlife_id, "Weirdo Boov", "Litoria caerulea", new_category_id, {"Habitat": "rainforest in Australia"})
    print(f"Wildlife edited successfully with ID: {edit_wildlife_id}")

    #make sure it displays changes properly -- add get wildlife call to api_callers, but seems to be working

except Exception as e:
    print(e)


