# Execute a Playbook

As a core feature of SSM, executing a playbook can be done from multiple locations across the interface.

## 1.A. Executing a playbook from the Devices panel

From the Devices panel, you can apply a playbook **to all your devices** using the "Apply to All" button in the top right corner.

![execplaybook1](/exec-playbook-1.png)

You can also apply a playbook to only one device by clicking on the drop-down arrow in the device line and selecting "Execute a playbook".

![execplaybook2](/exec-playbook-2.png)

![execplaybook3](/exec-playbook-3.png)

## 1.B. Executing a playbook from the Inventory panel

The Inventory panel provides a more customizable way of applying playbooks to your devices.
You can select one or more devices and choose a playbook to execute.

![execplaybook4](/exec-playbook-4.png)

## 2. Playbook selection modal

Before executing your playbook, you can choose to override the variables contained in the playbook.

[See official documentation](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html)

![execplaybook5](/exec-playbook-5.png)

Without clicking on "save for future execution", the value will be used only for this execution.

## 3. Following your playbook execution

Once the playbook is launched, the terminal modal will open where you will see the logs and status of the current execution.

![execplaybook6](/exec-playbook-6.png)
