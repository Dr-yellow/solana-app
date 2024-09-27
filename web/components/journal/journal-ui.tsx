"use client";

import { PublicKey } from "@solana/web3.js";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useJournalProgram,
  useJournalProgramAccount,

} from "./journal-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

import { Modal, Form, Input, message, Button, FormProps, Space, Descriptions, DescriptionsProps, Popconfirm } from 'antd';

export interface CreateEntryArgs {
  title?: string;
  message?: string;
  data?: string;
  price?: string;
  members?: string;
  owner?: PublicKey;
  account?: PublicKey;
}

export const JournalCreate = () => {

  const { createEntry } = useJournalProgram();
  const { publicKey } = useWallet();
  const [messageApi] = message.useMessage();

  const [open, setOpen] = useState(false);

  const [form] = Form.useForm()


  const onCreate: FormProps<CreateEntryArgs>['onFinish'] = async (values) => {
    console.log('Success:', values);
    const { title, message, data, price, }: CreateEntryArgs = values;

    try {
      if (publicKey && title && message && data && price) {
        const res = await createEntry.mutateAsync({ title, message, data, price, members: '.', owner: publicKey });
        console.log('-res-', res);
        if (res) {
          setOpen(false);
          messageApi.open({
            type: 'success',
            content: 'success release',
          });
        }
      }
    } catch (e: any) {
      console.log('-e-', e);

      messageApi.open({
        type: 'warning',
        content: e.message,
      });
    }

  };



  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }
  return (

    <div className="max-w-xl py-6 mx-auto text-center sm:px-6 lg:px-8">
      <Button type="primary" size="large" style={{ backgroundColor: '#5c20dd', color: '#fff' }} onClick={() => setOpen(true)}>
        Create LiveRoom
      </Button>

      <Modal
        open={open}
        title="release product"
        okText={createEntry.isPending ? 'releasing...' : 'success release'}
        okButtonProps={{ autoFocus: true, htmlType: 'submit', className: '!bg-black !text-white' }}
        onCancel={() => setOpen(false)}
        destroyOnClose
        confirmLoading={createEntry.isPending}
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="form_in_modal"
            initialValues={{ modifier: 'public' }}
            clearOnDestroy
            onFinish={onCreate}
          >
            {dom}
          </Form>
        )}
      >

        <Form.Item name="title" label="name"
          rules={[{ required: true, message: 'Please enter the product name!' }]}
        >
          <Input placeholder='Please enter the product name!' />
        </Form.Item>
        <Form.Item name="message" label="description"
          rules={[{ required: true, message: 'Please enter the product description!' }]}
        >
          <Input.TextArea placeholder='Please enter the product description!' />
        </Form.Item>
        <Form.Item name="data" label="link"
          rules={[{ required: true, message: 'Please enter the product link!' }]}
        >
          <Input.TextArea placeholder='Please enter the product link!' />
        </Form.Item>
        <Form.Item name="price" label="Price"
          rules={[{ required: true, message: 'Please enter the product price!' }]}
        >
          <Input placeholder='Please enter the product price!' type='number' />
        </Form.Item>
      </Modal>
    </div>
  );
}

function descriptionComp({ title, message, data, price, owner, account }: CreateEntryArgs) {
  const items: DescriptionsProps['items'] = [
    {
      key: '1',
      label: 'name',
      children: <p>{title}</p>,
    },
    {
      key: '2',
      label: 'message',
      children: <p>{message}</p>,
    },
    {
      key: '3',
      label: 'data',
      children: <p>{data}</p>,
    },
    {
      key: '4',
      label: 'price',
      children: <p>{price}</p>,
    },
    {
      key: '5',
      label: 'owner',
      children: <p>{ellipsify(owner?.toString())}</p>
    },
    {
      key: '6',
      label: 'account',
      children: <ExplorerLink
        path={`account/${account}`}
        label={ellipsify(account?.toString())}
      />
    },

  ];
  return items
}
export function JournalList() {
  const { accounts, getProgramAccount } = useJournalProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid gap-4 md:grid-cols-4">
          {accounts.data?.map((account) => (
            <JournalCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function JournalCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useJournalProgramAccount({
    account,
  });
  const { publicKey } = useWallet();
  const title = accountQuery.data?.title;
  const message = accountQuery.data?.message;
  const data = accountQuery.data?.data;
  const price = accountQuery.data?.price;
  const owner = accountQuery.data?.owner;

  const handleUpdate = () => {
    if (publicKey && title && message && data && price) {
      const now = new Date();
      updateEntry.mutateAsync({ title, message, data, price, members: now.toLocaleTimeString(), owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  const confirm = (value: string | undefined) =>
    new Promise((resolve) => {

      setTimeout(async () => {
        const res = await deleteEntry.mutateAsync(value || '')
        resolve(null)
        console.log('hhhhhh')
        console.log('res---', res)

      }, 1000);
    });

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="border-4 card card-bordered border-base-300 text-neutral-content">

      <div className="flex items-center card-body ">
        <Descriptions title={<div className="text-2xl text-white">LiveRoom Card</div>} column={1} items={descriptionComp({ title, message, data, price, owner, account })}
          contentStyle={{ color: '#fff' }}
          labelStyle={{ color: '#fff' }}
          bordered />
        <Space size={'large'}>

          {/* className="btn btn-xs btn-secondary btn-outline" */}
          <Button
            style={{ backgroundColor: '#5c20dd', border: 0, color: '#fff' }}
            onClick={() => {
              if (
                !window.confirm(
                  "Are you sure you want to update this account?"
                )
              ) {
                return;
              }
              handleUpdate();
            }}
            disabled={updateEntry.isPending}
          >
            books
          </Button>


          <Popconfirm
            title="Title"
            description="Are you sure you want to delete this product?"
            onConfirm={() => confirm(title)}
            onOpenChange={() => console.log('open change')}
            okButtonProps={{ className: '!bg-black !text-white' }}

          >
            <Button
              style={{ backgroundColor: '#5c20dd', border: 0, color: '#fff' }}
              color="default" type="primary">remove</Button>
          </Popconfirm>
          <Button
            style={{ backgroundColor: '#5c20dd', border: 0, color: '#fff' }}
            href="/detail"
          >
            in
          </Button>
        </Space>

      </div>

    </div>
  );
}
