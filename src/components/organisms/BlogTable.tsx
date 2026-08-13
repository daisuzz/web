import * as React from "react"
import {DateUtils} from "../../DateUtils"
import {Box, Link, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableRow, Tabs, Typography} from "@mui/material";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

interface BlogArticleTableProps {
    qiitaBlogs: ExternalBlog[]
    hatenaBlogs: ExternalBlog[]
}

export interface ExternalBlog {
    id: string
    link: string
    title: string
    publishedAt: string
}

const BlogTable: React.FC<BlogArticleTableProps> = ({qiitaBlogs, hatenaBlogs}) => {
    const [value, setValue] = React.useState('0');
    const handleChange = (_: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    return (
        <Box>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={value} onChange={handleChange} aria-label="blog tabs" textColor={'inherit'}>
                    <Tab label="Hatena Blog" value="0"/>
                    <Tab label="Qiita" value="1"/>
                </Tabs>
            </Box>
            <Box sx={{padding: '0px'}} hidden={value !== '0'}>
                {tableTemplate(hatenaBlogs)}
            </Box>
            <Box sx={{padding: '0px'}} hidden={value !== '1'}>
                {tableTemplate(qiitaBlogs)}
            </Box>
        </Box>
    )
}

function tableTemplate(blogs: ExternalBlog[]): React.JSX.Element {
    return (
        <TableContainer component={Paper} elevation={0}>
            <Table size="small">
                <TableBody>
                    {blogs.map(blog => tableRowTemplate(blog))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

function tableRowTemplate(blog: ExternalBlog): React.JSX.Element {
    const title = blog.title || blog.id
    const publishedDate = DateUtils.formatDate(
        new Date(Date.parse(blog.publishedAt)),
        "YYYY-MM-DD hh:mm"
    )
    return (
        <TableRow key={blog.id}
                  sx={{'&:last-child td, &:last-child th': {border: 0}}}
        >
            <TableCell align="left">
                <Typography variant="body1" sx={{
                    margin: "20px auto"
                }}>
                    <Link
                        component={"a"}
                        href={blog.link}
                        rel="noreferrer noopener"
                        target="_blank"
                        color="inherit"
                        underline="none"
                    >
                        {title}
                    </Link>
                </Typography>
                <Box sx={{display: {xs: 'flex', md: 'flex'}}}>
                    <EventAvailableIcon fontSize="small"/>
                    <Typography variant="body2" sx={{
                        margin: "auto auto auto 10px"
                    }}>
                        {publishedDate}
                    </Typography>
                </Box>
            </TableCell>
        </TableRow>
    )
}

export default BlogTable
